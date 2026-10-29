from pydantic import BaseModel
class TemperatureSchema(BaseModel):
    celsius: float
    kelvin: float
    fahrenheit: float
    pressure: float
    visibility: float
    humidity: float
    feel_like_celsius: float
    feel_like_kelvin: float
    feel_like_farhrenheit: float
    feel_like_level: str




def kelvin_to_celsius(k: float) -> float:
    return round(k - 273.15, 2)


def kelvin_to_fahrenheit(k: float) -> float:
    return round((k - 273.15) * 9 / 5 + 32, 2)

def feels_like_to_celsius(k:float):
    return round(k-273.15,2)
def feels_like_to_farhrenheit(k:float):
    return round((k-273.15) * 9 / 5 + 32,2)

def convert_temperature(
    kelvin: float,
    humidity:float,
    feel_like:float,
    visibility:float,
    pressure:float) -> TemperatureSchema:
    return TemperatureSchema(
        humidity= humidity,
        feel_like_celsius=feels_like_to_celsius(feel_like),
        feel_like_kelvin=feel_like,
        feel_like_farhrenheit=feels_like_to_farhrenheit(feel_like),
        feel_like_level=classify_feel_like_level(feels_like_to_celsius(feel_like)),
        visibility=visibility,
        pressure=pressure,
        celsius=kelvin_to_celsius(kelvin),
        kelvin=round(kelvin, 2),
        fahrenheit=kelvin_to_fahrenheit(kelvin),
    )

def classify_level(celsius: float) -> str:
    if celsius < 0:
        return "Extremely Cold"
    elif celsius < 10:
        return "Cold"
    elif celsius <= 30:
        return "Average"
    elif celsius <= 35:
        return "Hot"
    else:
        return "Extremely Hot"
    
def classify_feel_like_level(celsius: float) -> str:
    if celsius < 0:
        return "Extremely Cold"
    elif celsius < 10:
        return "Cold"
    elif celsius <= 30:
        return "Average"
    elif celsius <= 35:
        return "Hot"
    else:
        return "Extremely Hot"