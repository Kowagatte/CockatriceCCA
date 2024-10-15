import requests
import re

x = requests.get('https://api.scryfall.com/cards/mm3/24/')

print(x.json()["image_uris"]["png"])

def parse_card_line(card):
    match = re.findall(r'(\d) (\S.+)\s\((\S.+)\)\s([^\s]+).*', card)
    return match

def get_from_scryfall(set, num):
    #print(f"https://api.scryfall.com/cards/{set.lower()}/{num.lower()}/")
    x = requests.get(f"https://api.scryfall.com/cards/{set.lower()}/{num.lower()}/")
    return x.json()

def parse_to_cock(sj):

    pt = ""
    if "power" in sj:
        pt = "<pt>" + sj["power"] + "/" + sj["toughness"] + "</pt>\n"
    
    mid = ""
    if "multiverse_ids" in sj:
        if len(sj["multiverse_ids"]) > 0:
            mid = sj["multiverse_ids"][0]

    return f"""
    <card>
      <name>{sj["name"]}</name>
      <text>{sj["oracle_text"]}</text>
      <prop>
          <layout>{sj["layout"]}</layout>
          <side>front</side>
          <type>{sj["type_line"]}</type>
          <manacost>{sj["mana_cost"]}</manacost>
          <cmc>{sj["cmc"]}</cmc>
          <colors>{"".join(sj["colors"])}</colors>
          <coloridentity>{"".join(sj["color_identity"]).replace("{", "").replace("}", "")}</coloridentity>
          {pt}
          <format-standard>{sj["legalities"]["standard"]}</format-standard>
          <format-commander>{sj["legalities"]["commander"]}</format-commander>
          <format-modern>{sj["legalities"]["modern"]}</format-modern>
          <format-pauper>{sj["legalities"]["pauper"]}</format-pauper>
      </prop>
      <set rarity="{sj["rarity"]}" uuid="{sj["oracle_id"]}" num="{sj["collector_number"]}" muid="{mid}" picurl="{sj["image_uris"]["normal"]}">{deck_name}</set>
    </card>"""

cards = []

inp = open(input("Enter filename: "), "r")
deck_name = inp.readline().replace("\n", "")
inp.readline()
count = 1
for line in inp:
    if line != "\n":
        print(count)
        sanitized = parse_card_line(line)
        scryfall_data = get_from_scryfall(sanitized[0][2], sanitized[0][3])
        #print(scryfall_data)
        parsed = parse_to_cock(scryfall_data)
        cards.append(parsed)
        count += 1
#print(deck_name)


custom_file = open("deck.xml", "w+", encoding="utf-8")

header = f"""<?xml version="1.0" encoding="UTF-8"?>
<cockatrice_carddatabase version="4">
  <sets>
    <set>
      <name>{deck_name}</name>
      <longname>This is a custom art deck</longname>
      <settype>Custom</settype>
      <releasedate>2024-10-10</releasedate>
    </set>
  </sets>
  <cards>"""

footer = """
  </cards>
</cockatrice_carddatabase>"""



custom_file.write(header)
for card in cards:
    custom_file.write(card)
custom_file.write(footer)
custom_file.close()