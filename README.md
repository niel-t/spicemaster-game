# Spicemaster Game

First-person simulator-type game; think: thief simulator, drug-dealer simulator, or retro-rewind. The game style is 90s-style.  

## Project status

Early planning. The game engine and platform target are still open (see `docs/decisions.md`). Perhaps Unity. 

## Scene setting

**Premise.** Eddy Jr. receives a key to his father Eddy's small warehouse. Inside is a collection of old machines that his father has sold to shawarma vendors over the years. The very first task is to clear the warehouse and free up space. Eddy Jr. can sell those old machines for money using an old 90s PC, then use it to buy his first batch of supplies and tools to start mixing. 

The father also knows secret recipes for shawarma and chicken spices, which butchers and shawarma shops across fictional Kaasland use. Eddy Jr. takes the van, a blue Volkswagen T5, and heads out to grow the business and take over the spice trade. All this helps you get started.

Throughout the game, Eddy Jr. can expand the warehouse, buy more mixers to mix spices, and eventually hire "Naknikim," stupid idiots who help mix spices or run the back of house. 

Spices can eventually get more complex with more ingredients, and you can sell them for more money. The GOAT is always the ultimate shawarma spice. 

Acquiring the ingredients is also part of the game; you have to get them from different vendors, and weigh price vs. quality vs. quantity. You do all of this from your 90s PC. 

Meanwhile, you can send off different shipments (to you, whether you deliver yourself or send them via courier).

Another part of the game is beating up customers that don't pay, 

**Goal.** Expand the business and become the ultimate spice kingpin in Kaasland. 

### Phase 1: Early game (repair and trade)

- sell the old rusty equipment, clear the warehouse, and set up shop
- buy spices and ingredients to start building up stock
- gain enough money to start investing in the factory and recipes.

### Phase 2: Mid to late game (delivery and management)

- Deliver spices to customers in the blue T5 (delivery module, see below).
- Money grows, and management becomes more demanding.
- Customers become harder to handle: late payment, complaints, and pressure to lower prices.

### Core systems

- **Factory and RPG (management module):** expand the factory, unlock and add recipes, set prices, plan and run production batches, and manage stock and cash.
- **Delivery module:** a separate driving mode in the blue T5. Drive around, deliver orders on time, and handle what happens on the road.
- **Customers:** each customer has a personality and a payment record. Some pay late, some complain, some pressure you. The player decides how to respond: negotiate a payment plan, send a reminder, call in a debt collector, or drop the account. Each choice has financial and reputational consequences.
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
