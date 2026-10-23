from pydantic import BaseModel


class TemperatureSchema(BaseModel):
    celsius: float
    kelvin: float
    fahrenheit: float


def kelvin_to_celsius(k: float) -> float:
    return round(k - 273.15, 2)


def kelvin_to_fahrenheit(k: float) -> float:
    return round((k - 273.15) * 9 / 5 + 32, 2)


def convert_temperature(kelvin: float) -> TemperatureSchema:
    return TemperatureSchema(
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
