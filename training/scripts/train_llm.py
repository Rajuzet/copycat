"""
CanvasCord AI: Custom Transformer LLM Training Suite
Trains a specialized UI & Vector Canvas Language Model on curated open-source design instructions.
"""

import json
import os
import math
import time
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

# Hyperparameters
EMBED_DIM = 128
NUM_HEADS = 4
NUM_LAYERS = 3
FFN_DIM = 256
MAX_SEQ_LEN = 512
BATCH_SIZE = 2
EPOCHS = 10
LEARNING_RATE = 1e-3

class SimpleCharTokenizer:
    """Character-level tokenizer for structured JSON & instruction tokens."""
    def __init__(self):
        # Base vocabulary of all JSON characters, alphanumeric, and special tokens
        self.pad_token = "<pad>"
        self.bos_token = "<bos>"
        self.eos_token = "<eos>"
        chars = sorted(list(set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 \n\t{}[]\":,.-_#/$%+•✓▶★●■📱⚡🎨🚀💳🛒📊✨🔍•\r")))
        self.vocab = [self.pad_token, self.bos_token, self.eos_token] + chars
        self.token2id = {c: i for i, c in enumerate(self.vocab)}
        self.id2token = {i: c for i, c in enumerate(self.vocab)}

    def encode(self, text):
        return [self.token2id.get(c, self.token2id[self.pad_token]) for c in text]

    def decode(self, ids):
        return "".join([self.id2token.get(i, "") for i in ids if i not in [0, 1, 2]])

    @property
    def vocab_size(self):
        return len(self.vocab)

class UIDesignDataset(Dataset):
    def __init__(self, jsonl_path, tokenizer, max_len=MAX_SEQ_LEN):
        self.samples = []
        self.tokenizer = tokenizer
        self.max_len = max_len

        if os.path.exists(jsonl_path):
            with open(jsonl_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if not line.strip():
                        continue
                    entry = json.loads(line)
                    # Build full prompt-response text
                    msgs = entry["messages"]
                    full_text = f"<bos>Instruction: {msgs[1]['content']}\nResponse: {msgs[2]['content']}<eos>"
                    token_ids = self.tokenizer.encode(full_text)
                    if len(token_ids) > self.max_len:
                        token_ids = token_ids[:self.max_len]
                    self.samples.append(token_ids)

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        tokens = self.samples[idx]
        pad_len = self.max_len - len(tokens)
        input_ids = tokens + [0] * pad_len
        target_ids = tokens[1:] + [0] * (pad_len + 1)
        return torch.tensor(input_ids, dtype=torch.long), torch.tensor(target_ids, dtype=torch.long)

class CausalSelfAttention(nn.Module):
    def __init__(self, embed_dim, num_heads):
        super().__init__()
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads

        self.qkv_proj = nn.Linear(embed_dim, 3 * embed_dim)
        self.out_proj = nn.Linear(embed_dim, embed_dim)

    def forward(self, x):
        B, T, C = x.size()
        qkv = self.qkv_proj(x)
        q, k, v = qkv.chunk(3, dim=-1)

        q = q.view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        k = k.view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        v = v.view(B, T, self.num_heads, self.head_dim).transpose(1, 2)

        # Scaled dot-product attention with causal mask
        scores = (q @ k.transpose(-2, -1)) / math.sqrt(self.head_dim)
        mask = torch.triu(torch.ones(T, T, device=x.device), diagonal=1).bool()
        scores = scores.masked_fill(mask, float('-inf'))
        weights = torch.softmax(scores, dim=-1)

        out = (weights @ v).transpose(1, 2).contiguous().view(B, T, C)
        return self.out_proj(out)

class TransformerBlock(nn.Module):
    def __init__(self, embed_dim, num_heads, ffn_dim):
        super().__init__()
        self.ln1 = nn.LayerNorm(embed_dim)
        self.attn = CausalSelfAttention(embed_dim, num_heads)
        self.ln2 = nn.LayerNorm(embed_dim)
        self.ffn = nn.Sequential(
            nn.Linear(embed_dim, ffn_dim),
            nn.GELU(),
            nn.Linear(ffn_dim, embed_dim),
        )

    def forward(self, x):
        x = x + self.attn(self.ln1(x))
        x = x + self.ffn(self.ln2(x))
        return x

class DesignTransformerLM(nn.Module):
    """Generative Transformer Language Model for Design Synthesis."""
    def __init__(self, vocab_size, embed_dim=EMBED_DIM, num_heads=NUM_HEADS, num_layers=NUM_LAYERS, ffn_dim=FFN_DIM, max_len=MAX_SEQ_LEN):
        super().__init__()
        self.token_emb = nn.Embedding(vocab_size, embed_dim)
        self.pos_emb = nn.Embedding(max_len, embed_dim)
        self.blocks = nn.ModuleList([
            TransformerBlock(embed_dim, num_heads, ffn_dim)
            for _ in range(num_layers)
        ])
        self.ln_f = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, vocab_size, bias=False)

    def forward(self, input_ids):
        B, T = input_ids.size()
        pos = torch.arange(0, T, device=input_ids.device).unsqueeze(0)
        x = self.token_emb(input_ids) + self.pos_emb(pos)

        for block in self.blocks:
            x = block(x)

        x = self.ln_f(x)
        logits = self.head(x)
        return logits

def train():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"[*] Initializing CanvasCord Design LLM Training on {device}...")

    tokenizer = SimpleCharTokenizer()
    base_dir = os.path.dirname(os.path.dirname(__file__))
    train_path = os.path.join(base_dir, 'data', 'train.jsonl')
    eval_path = os.path.join(base_dir, 'data', 'eval.jsonl')
    checkpoint_dir = os.path.join(base_dir, 'checkpoints')
    results_dir = os.path.join(base_dir, 'results')
    os.makedirs(checkpoint_dir, exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)

    train_dataset = UIDesignDataset(train_path, tokenizer)
    eval_dataset = UIDesignDataset(eval_path, tokenizer)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    eval_loader = DataLoader(eval_dataset, batch_size=BATCH_SIZE, shuffle=False)

    model = DesignTransformerLM(tokenizer.vocab_size).to(device)
    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"[+] Model Architecture: {NUM_LAYERS} Transformer layers, {NUM_HEADS} heads, {EMBED_DIM} embed dim")
    print(f"[+] Total Trainable Parameters: {total_params:,}")

    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=0.01)
    criterion = nn.CrossEntropyLoss(ignore_index=0)

    history = {"train_loss": [], "eval_loss": [], "perplexity": []}
    best_loss = float('inf')

    start_time = time.time()
    for epoch in range(1, EPOCHS + 1):
        model.train()
        total_train_loss = 0.0

        for inputs, targets in train_loader:
            inputs, targets = inputs.to(device), targets.to(device)
            optimizer.zero_grad()

            logits = model(inputs)
            loss = criterion(logits.view(-1, tokenizer.vocab_size), targets.view(-1))
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            total_train_loss += loss.item()

        avg_train_loss = total_train_loss / max(1, len(train_loader))

        # Evaluation
        model.eval()
        total_eval_loss = 0.0
        with torch.no_grad():
            for inputs, targets in eval_loader:
                inputs, targets = inputs.to(device), targets.to(device)
                logits = model(inputs)
                loss = criterion(logits.view(-1, tokenizer.vocab_size), targets.view(-1))
                total_eval_loss += loss.item()

        avg_eval_loss = total_eval_loss / max(1, len(eval_loader))
        perplexity = math.exp(min(avg_eval_loss, 20.0))

        history["train_loss"].append(round(avg_train_loss, 4))
        history["eval_loss"].append(round(avg_eval_loss, 4))
        history["perplexity"].append(round(perplexity, 2))

        print(f"Epoch [{epoch:02d}/{EPOCHS:02d}] | Train Loss: {avg_train_loss:.4f} | Eval Loss: {avg_eval_loss:.4f} | Perplexity: {perplexity:.2f}")

        if avg_eval_loss < best_loss:
            best_loss = avg_eval_loss
            ckpt_path = os.path.join(checkpoint_dir, 'best_model.pt')
            torch.save({
                'model_state_dict': model.state_dict(),
                'epoch': epoch,
                'eval_loss': best_loss,
                'vocab_size': tokenizer.vocab_size,
            }, ckpt_path)

    elapsed = time.time() - start_time
    print(f"\n[+] Training Complete in {elapsed:.2f} seconds!")
    print(f"[+] Best Model checkpoint saved to: {os.path.join(checkpoint_dir, 'best_model.pt')}")

    # Export training metrics
    metrics_path = os.path.join(results_dir, 'training_metrics.json')
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump({
            "model_name": "CanvasCord-Design-LM",
            "parameters": total_params,
            "epochs": EPOCHS,
            "duration_sec": round(elapsed, 2),
            "final_train_loss": history["train_loss"][-1],
            "final_eval_loss": history["eval_loss"][-1],
            "final_perplexity": history["perplexity"][-1],
            "history": history
        }, f, indent=2)

    print(f"[+] Metrics exported to: {metrics_path}")

if __name__ == '__main__':
    train()

