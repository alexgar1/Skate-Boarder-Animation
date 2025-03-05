# Animation of a skateboarder.

He first performs a tre flip off of a drop, then does a kickflip into a 5-0 grind (rear truck grind).

The skater is a hierachical model.
Although he looks similar to the diver in the previous assignment, he has been redesigned where the foot is the origin to keep him on the baord and joints have different architecture
to support the movement of jumping and landing.
Knee bending and gravity use functions to make them seem more natural.
Skater's knees bend down slowly and back up before the jump.
Skater jumps and knees bend again to allow board to make rotation with out collision
Knees come back down to catch the board mid air.
Skater lands and knees bend to brace the fall.
Skater returns to normal riding position.
When the skater lands after the first drop, he does a small powerslide turn (sliding on wheels) making the massive drop feel more realistic.

Converted shader from vertex to fragment

Converted the Phong to Blinn-Phong in the new fragment shader  

created 6 shaders:
1 & 2 (blended) concrete on first stage
3  metal used for rail and trucks
4 cracked concrete on second and third stage
5 denim pants texture on skater's legs
6 grip tape texture on deck of skateboard

The camera moves dynamically throughout the sequece and then features a full 360 spin at the end.

Animation uses real time and key framing to determine events. Frames are counted by every animation window that is requested.

Frame rate is displayed in top left corner. It is rounded to the integer; it does in fact change slightly but it is negligable.

Unfortunately, I was unable to create a shader that changes with time. 
