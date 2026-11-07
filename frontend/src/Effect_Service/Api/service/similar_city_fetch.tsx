import { DateTimeInfo } from "./open_weather";

const BASE_URL = "https://weather-application-backend-5fb0.onrender.com";


export interface SimilarSchemes{
    city:string;
    country:string;
    country_code: string;
    lat:number;
    lon:number;
    type:string;
    timezone:DateTimeInfo;
    daytime:string;

}
export interface SimilarResponse{
    detail:string;
    city_list_info: SimilarSchemes[]
}

export default async function FetchSimilarCity(city:string):Promise<SimilarResponse> {
   try{
  
     const res = await fetch(`${BASE_URL}/similar_city?city=${encodeURIComponent(city)}`,{
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    const data = await  res.json()
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    
    return data as SimilarResponse;
   } catch(error){
    throw new Error(`Cannot Fetch the similar city API due: ${error}`);
   }
}



