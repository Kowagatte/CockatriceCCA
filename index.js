var deck_name = ""

function save(filename, data) {
    const blob = new Blob([data], {type: 'text/csv'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
}

async function get_from_scryfall(set, num){
    const url = `https://api.scryfall.com/cards/${set.toLowerCase()}/${num.toLowerCase()}/`
    try{
        const response = await fetch(url)
        if(!response.ok){
            throw new Error(`Response status: ${response.status}`)
        }
        const json = await response.json()
        //console.log(json)
        return json
    }catch(error){
        console.error(error)
    }
}

function parse_card_line(card){
    const reg = /(\d)\s(\S.+)\s\((\S.+)\)\s([^\s]+).*/g
    //return card.replace(reg, '$1').split("/#/")
    const array = [...card.matchAll(reg)]
    array[0].shift()
    return array[0]
}

function parse_to_cock(sj){
    pt = ""
    if ("power" in sj){
        pt = "<pt>" + sj["power"] + "/" + sj["toughness"] + "</pt>\n"
    }
    
    mid = ""
    if ("multiverse_ids" in sj){
        if (sj["multiverse_ids"].length > 0){
            mid = sj["multiverse_ids"][0]
        }
    }

    return `
    <card>
      <name>${sj["name"]}</name>
      <text>${sj["oracle_text"]}</text>
      <prop>
        <layout>${sj["layout"]}</layout>
        <side>front</side>
        <type>${sj["type_line"]}</type>
        <manacost>${sj["mana_cost"]}</manacost>
        <cmc>${sj["cmc"]}</cmc>
        <colors>${sj["colors"].join("")}</colors>
        <coloridentity>${sj["color_identity"].join("")}</coloridentity>
        ${pt}
        <format-standard>${sj["legalities"]["standard"]}</format-standard>
        <format-commander>${sj["legalities"]["commander"]}</format-commander>
        <format-modern>${sj["legalities"]["modern"]}</format-modern>
        <format-pauper>${sj["legalities"]["pauper"]}</format-pauper>
      </prop>
      <set rarity="${sj["rarity"]}" uuid="${sj["oracle_id"]}" num="${sj["collector_number"]}" muid="${mid}" picurl="${sj["image_uris"]["normal"]}">${deck_name}</set>
    </card>`
}




async function download(){
    deck_name = document.getElementById('deck_name').value
    var deck_list = document.getElementById('deck_list').value.split("\n")

    header = `<?xml version="1.0" encoding="UTF-8"?>
<cockatrice_carddatabase version="4">
  <sets>
    <set>
    <name>${deck_name}</name>
    <longname>This is a custom art deck</longname>
    <settype>Custom</settype>
    <releasedate>2024-10-10</releasedate>
    </set>
  </sets>
  <cards>`

    footer = `
  </cards>
</cockatrice_carddatabase>`

    //console.log(deck_list)

    const cards = []
    for(line in deck_list){
        if(line != ""){
            //console.log("Line: " + deck_list[line])
            var sanitized = parse_card_line(deck_list[line])
            var scryfall_data = await get_from_scryfall(sanitized[2], sanitized[3])
            var parsed = parse_to_cock(scryfall_data)
            cards.push(parsed)
        }
    }

    var compiled = ""
    compiled += header
    for(card in cards){
        compiled += cards[card]
    }
    compiled += footer
    save(deck_name+".xml", compiled)

    console.log("finished")
}