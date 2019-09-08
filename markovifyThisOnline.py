import os
import sys
import markovify
import json

# Variables
text = ''
tweetables = {}
# End variables

for book in sys.argv:
    with open(book) as f:
    #with open("books/RomeoAndJuliet.txt") as f:
        text += f.read()

# let the Markovify module read the text
text_model = markovify.Text(text)

# create 5 tweetable blurbs, add to the return message
for i in range(5):
    tweetables[i] = text_model.make_short_sentence(140)

print(json.dumps(tweetables))
sys.stdout.flush()
