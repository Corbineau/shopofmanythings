# shopofmanythings

The intent was to have a shop with a shopping cart, where items could be added and removed appropriately.

1) app connects to database, displays items in a table.
2) user is given a prompt where they can add an item to the cart (validate to be sure item exists).
3) user is asked how many they wish to add (validate to be sure there are enough).
4) user is asked if they want to add anything else. If yes, go to step 2.
5) If no, user is shown the cart and total, and asked if they would like to make changes.
6) If they wish to make changes, they are shown a list prompt, which calls methods in the cart object to remove items, or change the quantity.
7) if they are happy with the cart, they are able to checkout. checkout removes quantities from the database.

## issues

I had huge problems with connecting to the database intitially, making it difficult to test the code. Finally, was able to resolve this by specifying the db and port in the actual js file rather than through config.