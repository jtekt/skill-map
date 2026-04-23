# 🧠 Skill Map

A network-based skill visualization platform built with Nuxt 4.

Skill Map represents skills the way they actually behave in real life: **interconnected, cross-domain, and evolving**. Instead of flat lists, skills are displayed as a **graph (network map)** where relationships between abilities, knowledge areas, and disciplines become visible and explorable.

---

## ✨ What is Skill Map?

Most systems treat skills like checkboxes.

Skill Map treats them like a **living network**.

A single skill can:

- Branch into multiple domains
- Connect across disciplines
- Evolve through relationships with other skills

### 🌐 Example Connections

Not limited to tech:

- **TypeScript** → Backend / Frontend → Node.js / Vue
- **Photography** → Lighting → Composition → Editing
- **Cooking** → Knife Skills → Food Safety → Recipe Design
- **Communication** → Writing → Public Speaking → Negotiation

Different domains. Same structure.

---

## ✨ Features

### 🔗 Skill Network Visualization

- Interactive graph powered by D3
- Skills connected based on relationships
- Explore clusters across _any domain_

### 👤 User Skill Profiles

- Add skills to your profile
- Assign **proficiency levels**
- Visualize your personal skill network

### 👥 Skill Comparison

- Compare your skills with:
  - The entire skill map
  - Other users

- Focus on **skill overlap**, not proficiency ranking

### 📊 Dual View Modes

- **Graph View**: Network-based visualization
- **Table View**: Structured, sortable data

### 🔍 User Lookup (Optional)

- Enrich user display names via external API
- Falls back gracefully if not configured

---

## 🏗️ Tech Stack

- **Frontend**: Nuxt 4
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Graph Rendering**: D3.js
- **Authentication**: OIDC via `nuxt-auth-utils`

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

---

### 2. Setup Environment Variables

Create a `.env` file:

```env
# Required
DATABASE_URL=
NUXT_OAUTH_OIDC_OPENID_CONFIG=
NUXT_OAUTH_OIDC_CLIENT_ID=
NUXT_SESSION_PASSWORD=

# Optional (User Lookup)
NUXT_PUBLIC_USER_LOOKUP_URL=
NUXT_PUBLIC_USER_LOOKUP_IDENTIFIER_FIELD=
NUXT_PUBLIC_USER_LOOKUP_DISPLAY_NAME_FIELD=

# Optional (OIDC identifier override)
NUXT_PUBLIC_AUTH_OIDC_IDENTIFIER_FIELD=
```

---

## 🔐 Authentication

This app uses OIDC via `nuxt-auth-utils`.

Expected user payload:

```ts
interface User {
  sub?: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
}
```

### Identifier Behavior

- Default identifier: `preferred_username`
- Override via:

```env
NUXT_PUBLIC_AUTH_OIDC_IDENTIFIER_FIELD=sub
```

---

## 👥 User Lookup Behavior

If configured:

- Fetches user display data from external API
- Maps identifier and display name fields

If NOT configured:

- Falls back to `user_id` stored in the database

---

## 🗄️ Database & Migrations

### Generate migrations

```bash
npm run db:generate
```

### Run migrations

```bash
npm run db:migrate
```

### Docker auto-migration

On container startup:

- Runs migrations **only if `DATABASE_URL` is set**
- Does NOT delete existing data

---

## 🧭 How It Works

### Skill Graph Model

Each skill:

- Can connect to multiple other skills
- Can belong to multiple domains
- Forms part of a **non-linear network**

This enables:

- Cross-domain learning paths
- Flexible skill representation
- Real-world complexity instead of rigid hierarchies

---

## 🧪 Development

```bash
npm run dev
```

---

## ⚠️ Notes

- Migration files must stay consistent across environments
- Graph performance depends on number of nodes (D3 simulation)

---

## 💡 Vision

Skill Map is designed to answer a simple idea:

> Skills don’t live in silos.
> They grow through connection.

Whether it’s technology, arts, trades, or soft skills, everything fits into the same network.
