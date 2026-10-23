
# daytime
def get_detailed_time_phase(current_time_str: int) -> str:

    hour = current_time_str

    # 1. กำหนดช่วงเวลาលម្អិត
    if 5 <= hour < 11:
        phase = "Morning"
    elif 11 <= hour < 14:
        phase = "Noon"
    elif 14 <= hour < 17:
        phase = "Evening"
    elif 17 <= hour <= 18:
        phase = "Sunset"
    elif 19 <= hour < 23:
        phase = "Night"
    elif 23 <= hour or hour < 5:
        phase = "Midnight"
    else:
        phase = "Night"

    # 2. កំណត់ Day ឬ Night នៅខាងមុខ (ចន្លោះម៉ោង 6 ដល់ 17 គឺ Day ក្រៅពីนั้น Night)
    if 6 <= hour < 18:
        day_night_prefix = "Day"
    else:
        day_night_prefix = "Night"

    if phase == "Night":
        return f"{phase}"
    else: 
        return f"{phase} ({day_night_prefix})"
