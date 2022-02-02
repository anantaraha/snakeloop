# SnakeLoop
A minimal game using HTML, CSS & Javascript. It makes uses of the CSS grid view to generate the game preview.

### Game Rules
- Make the snake catch the given foods   
- Catching food makes the snake longer   
- Avoid wall collision and self loop   
- Survive as long as possible to increase score   

### Basic Implementation
- The field is a CSS grid of size 41x41   
- The snake is an array of the acquired grid items by the snake   
- Every 150ms, the game elements(snake position, length etc.) are calculated & updated, resulting in a fixed framerate   
- In each frame, the grid items are colored/updated to draw the snake & food   
- Thus the snake speed depends on the framerate   
- The food is placed randomly, ensuring that the new food position is not on the snake itself   
- Navigation keypresses are buffered to make the snake responsive   
