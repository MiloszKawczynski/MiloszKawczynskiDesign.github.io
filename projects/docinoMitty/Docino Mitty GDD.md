# Dominatro - Equivalent Exchange

## Gameplay

### General assumptions

A city builder that involves placing dominoes, creating arrangements that improve the value of tiles so that they can be exchanged for tiles of the same total value. Tiles have their types. There should be many types, and each should bring something new and unique to the mechanics. Game concept is very content-based.

### Examples of tile types

- Houses - Placing houses next to each other in the number >= 3 of the same value increases the value
- Crops - If they are near water, they grow and their value increases each turn, but when they cross the threshold, they are destroyed.
- Water - The higher the value, the more turbulent the water, up to a certain point it has a better effect on crops, after exceeding it it can flood and destroy other tiles
- Road - Its value depends on how long it is
- Trees - Same as Crops
- Sawmill - If connected to a forest by a road, it lowers the value of the forest by 2 and enriches all adjacent tiles by 1
- Mill - Its value is equal to how turbulent the water next to it is

### Gameplay Loop

1. Player start with a pool of domino tiles
2. Player place them up
3. Player create a combos that increases the value of the placed tiles
4. Player trade one tile for another, probably a new, interesting one (we need to trigger the "Oh, what does this do?" reaction)
5. Repeat.

Through combos, the value of tiles on the player's side constantly increases, which means that you can exchange tiles while maintaining the exchange equality, and at the same time, the player continues to gain more tiles.

### Tile Placing Rules

The tiles would be placed similarly to dominoes. In dominoes, the values ​​of the tiles should match, but in our case, it would be better if the matching were based on type rather than value. This allows for greater freedom in placement and less reliance on randomness. Additionally, in our case it is enough for one tile to fit, the fact that other tiles already in place do not fit does not exclude the possibility of placing the tile.

## Graphics

Domino tiles should consist of a base and a graphic placed on top of that base. The graphic should represent its value visually, e.g., the number of houses, the number of crop cuts, the number of trees, etc.

## Inspiration

- Domino
- Grow Island (Browser Game) - The feeling that the island you're creating is growing and coming to life.
- Smörr Wörld (Game jam game made by friends from the science club) - The feeling of an expanding area of play.