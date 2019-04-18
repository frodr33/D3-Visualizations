# D3 Visualizations

## Description
For CS 3300 at Cornell University, we created two different visualizations displaying data obtained from `www.kaggle.com`. The first visualization is called Graduate Admissions. This visualization is broken up into a scatter plot showing the relationship between GPA/test scores and admittance into graduate schools. 

![screenshot](Demo-Images/toefl.png)

The second part of this visualization was a [Sankey Diagram](https://github.com/d3/d3-sankey). We displayed how GRE and GPA scores affect admission into graduate schools through different paths in the sankey. We do this for three of the nation's top schools: Cornell, Berkeley, and Yale. We made two different sankey graphs for the GRE and GPA attributes. In the example below, we only show the GPA Sankey. 

![screenshot](Demo-Images/sankey.png)

## How to install
OCaml and Opam must be installed prior to installing this project. If OCaml and Opam are not installed then follow the
tutorial at `http://www.cs.cornell.edu/courses/cs3110/2018sp/install.html`

If Ocaml and Opam are installed, then do the following steps:
	1. Clone the repository
	2. Enter `opam install js_of_ocaml js_of_ocaml-ocamlbuild js_of_ocaml-camlp4 js_of_ocaml-lwt` in terminal/command line
	3. In the terminal/command line enter `make`
	4. Click on `index.html` inside the repository directory
	5. A window in your default browser should open and fire-emblem should play automatically! (Click on the screen if nothing is happening)

## How to Play
For best playing experience, use Google Chrome
### Selection
When in the game, you will see various players, enemies, items, and menus. Using 'Z' you can select players to move by pressing on the currently active character. You can tell who the currently active character is by pressing 'A'. 'A' will automatically transfer the cursor over to the currently active character. You can also use 'Z' on enemies to see their range of movement, on menus when you need to select a choice on the menu, and on the ground when you want to end your turn. You can press 'X' to deselect something that has already been selected.

### Movement
When you press 'Z' when the cursor is on a player, an arrangement of blue and red tiles will appear. The blue tiles signify where the current character can move to. Red tiles signify tiles that the player can attack but cannot move to.

### Attacking
After movement, you have the option to attack. If you click on Attack, you will then have to choose an item to attack with. Once you choose an item, red tiles will appear on the map signifying where attacking is possible. If an enemy is on the red tile, simply press 'Z' when the cursor is on that tile. If no enemies are on any red tiles, you must deselect using 'X' and choose another option

## External Dependencies
Oscigen's js_of_ocaml library was used to build the GUI. The library translates Ocaml code to javascript and allows for more advanced GUI abilities than standard Ocaml GUI libraries

## Authors
- Frank Rodriguez [@frodr33](https://github.com/frodr33)
- Albert Tsao
- Darren Tsai
- Ray Gu

## NOTE
Albert Tsao is not included in the statistics for some reason
