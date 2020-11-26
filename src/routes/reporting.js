import { handleErr } from '../utils'
import {getVerifiedOrgsByCountryCount} from '../utils/aggregations'
/**
 * corresponds with country property in service.tags 
 * e.g. service.tags.united_states.Mental or service.tags.canada.Legal
**/
const countryList = ['united_states', 'canada', 'mexico']

export const getVerifiedOrgsCount = async (req, res) => {
    try {
        let result = {}, counts = {};
        counts = await countryList.map(async country => {
         const res = await getVerifiedOrgsByCountryCount(country)
         return result[`${country}`] = res[0].count || 0
        });
        await Promise.all(counts)
        return res.json({result: result});
    }
    catch(err)  {
        handleErr(err)
    }
}