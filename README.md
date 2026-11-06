# Spicemaster Game

A gory, top-down action game in the style of Hotline Miami, built as a shared project between two collaborators.

## Project status

Early planning. The game engine and platform target are still open (see `docs/decisions.md`).

## Scene setting

**Premise.** Eddy Jr. receives a key to the shed of his father, Eddy. Inside is a collection of old machines that the father has sold to shoarma vendors over the years. The father also knows secret recipes for shoarma and chicken spices, which butchers and shoarma shops across the Netherlands use. Eddy Jr. takes the van, a blue Volkswagen T5, and goes out into the world to grow the business and take over the spice trade.

**Goal.** Expand the business until Eddy Jr. controls the spice trade in the Netherlands.

### Phase 1: Early game (repair and trade)

- Repair shoarma grills for customers.
- Buy broken equipment from customers, repair it to a minimum standard, and resell it at the market for a profit.
- Build enough money to start investing in the factory and recipes.

### Phase 2: Mid to late game (delivery and management)

- Deliver spices to customers in the blue T5 (delivery module, see below).
- Money grows, and management becomes more demanding.
- Customers become harder to handle: late payment, complaints, and pressure to lower prices.

### Core systems

- **Factory and RPG (management module):** expand the factory, unlock and add recipes, set prices, plan and run production batches, and manage stock and cash.
- **Delivery module:** a separate driving mode in the blue T5. Drive around, deliver orders on time, and handle what happens on the road.
- **Customers:** each customer has a personality and a payment record. Some pay late, some complain, some pressure you. The player decides how to respond: negotiate a payment plan, send a reminder, call in a debt collector, or drop the account. Each choice has consequences for money and reputation.
- **Equipment trade (early game):** the repair and resale loop described above.

### Open questions

- Perspective: 3D or side view.
- Tone and violence level (the reference game is gory).
- Engine and platform.
- How recipes are unlocked and whether any come from the father's shed.

## Repository layout

```
docs/          Design notes, decisions, and the ideas backlog
  ideas.md     Raw ideas: mechanics, characters, levels, art, sound
  decisions.md Decisions that have been made, with the reason
  characters.md Character bios (The Consigliere, The Money Man, The Don)
src/           Game code (empty until an engine is chosen)
assets/        Art, sound, and level data
  art/
  audio/
  levels/
CONTRIBUTING.md How we work together
```

## Getting started

1. Clone the repo: `git clone https://github.com/niel-t/spicemaster-game`
2. Read `CONTRIBUTING.md`.
3. Add ideas to `docs/ideas.md` or open an issue.
