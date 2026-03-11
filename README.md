# 🚀 Redis: In-Memory Data Store & Caching

Redis is a high-performance NoSQL database that operates as a key-value store. Unlike traditional relational databases (like PostgreSQL) or document databases (like MongoDB), Redis stores everything in **RAM (Memory)**, making it exceptionally fast with sub-millisecond latency.

> [!NOTE]
> While Redis can persist data to disk, it is primarily used as a **caching layer** to speed up applications by storing frequently accessed or computationally expensive data.

---

## 🛠️ Getting Started

### Start the Redis Server
```bash
redis-server
```

### Connect via CLI
```bash
redis-cli
```

### Connection Defaults
- **Loopback IP:** `127.0.0.1`
- **Port:** `6379`

### Termination
To safely exit the Redis CLI:
```bash
quit
```

---

## 💡 Core Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `SET key value` | Set the string value of a key | `SET user:1 "John"` |
| `GET key` | Get the value of a key (returned as a bulk string) | `GET user:1` |
| `DEL key` | Delete a key | `DEL user:1` |
| `EXISTS key` | Check if a key exists (1 if yes, 0 if no) | `EXISTS user:1` |
| `FLUSHALL` | Delete **all keys** in all databases | `FLUSHALL` |
| `KEYS *` | List all keys (use with caution in production) | `KEYS user:*` |

---

## ⏳ Handling Expiration (TTL)

Managing the lifecycle of data is crucial for caching.

| Command | Description | Example |
| :--- | :--- | :--- |
| `EXPIRE key seconds` | Set a timeout on a key in seconds | `EXPIRE session:123 3600` |
| `PEXPIRE key ms` | Set a timeout on a key in milliseconds | `PEXPIRE temp:data 500` |
| `TTL key` | Get remaining time (-1: no expiry, -2: expired) | `TTL session:123` |
| `PERSIST key` | Remove the expiration from a key | `PERSIST session:123` |
| `SETEX key sec val` | Set value and expiration (Atomic) | `SETEX token 60 "abc"` |

---

## 📂 Data Structures & Examples

### 1. Lists
Ordered collections of strings, perfect for **Recent Activity Feeds** or **Message Queues**.

| Command | Description |
| :--- | :--- |
| `LPUSH / RPUSH` | Push value to Head (Left) or Tail (Right) |
| `LPOP / RPOP` | Remove and get value from Head or Tail |
| `LRANGE list start end` | Get a range of elements |
| `LTRIM list start end` | Trim list to specified range |
| `LPUSHX list value` | Push only if the list already exists |

**Example: Recent Notifications**
```bash
RPUSH notifications "Welcome!"
RPUSH notifications "You have a new follower"
# Keep only the last 5 notifications
LTRIM notifications 0 4
```

### 2. Sets
Unordered collections of **unique** strings. Ideal for **Post Likes** or **Unique Visitors**.

| Command | Description |
| :--- | :--- |
| `SADD set value` | Add value to the set |
| `SREM set value` | Remove value from the set |
| `SISMEMBER set value` | Check for existence |
| `SMEMBERS set` | List all members |
| `SINTER set1 set2` | Intersection of two sets |

**Example: Post Likes**
```bash
SADD post:101:likes "user:1"
SADD post:101:likes "user:2"
SADD post:101:likes "user:1" # Duplicate, won't be added
SCARD post:101:likes          # Get total likes count (2)
```

### 3. Hashes
Maps between string fields and string values. Perfect for **User Profiles** or **Objects**.

| Command | Description |
| :--- | :--- |
| `HSET hash field value` | Set field value in a hash |
| `HGET hash field` | Get field value |
| `HDEL hash field` | Delete field from hash |
| `HGETALL hash` | Get all fields and values |
| `HEXISTS hash field` | Check if field exists |

**Example: User Profile**
```bash
HSET user:profile:1 name "Alice" email "alice@example.com" age "25"
HGET user:profile:1 name
HINCRBY user:profile:1 age 1 # Increment age by 1
```