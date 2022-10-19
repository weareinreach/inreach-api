import source from './out.json' assert {type: 'json'}


const amount = 10
const data = source.filter((item) => !item.show_on_organization)

const total = data.length

for (let i = 0; i< amount; i++) {
    const randomIndex = Math.ceil(Math.random() * total)
    const item = data[randomIndex]
    
    const googUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURI([item.address, item.city, item.state, item.zip_code, item.country].join(', '))}&destination=${encodeURI([item.lat, item.long].join(','))}&travelmode=walking`

    console.info(`${item.name} - ${item.loc_id.$oid} - Public: ${item.show_on_organization}\n  ${googUrl}\n`)

}

