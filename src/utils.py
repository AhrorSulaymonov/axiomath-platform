import re


def replace_math_variables_phonetic(text: str) -> str:
    """
    Matematik o'zgaruvchi harflarni TTS uchun inglizcha/lotincha fonetik talaffuzga o'zgartiradi.
    Masalan: 'x ning qiymati' -> 'iks ning qiymati', '3x - 23 = 112' -> '3 iks - 23 = 112'
    Faqat yakka turgan (so'z ichida emas) matematik harflarni almashtiradi.
    """
    # Matematik o'zgaruvchilar va ularning to'g'ri talaffuzlari
    math_vars = {
        'x': 'iks',
        'X': 'Iks',
        'y': 'igrek',
        'Y': 'Igrek',
        'z': 'zet',
        'Z': 'Zet',
        'h': 'ash',
        'H': 'Ash',
    }

    # Matematik kontekstdagi katta harflar (faqat yakka turgan holda)
    math_symbols = {
        'S': 'es',
        'P': 'pe',
        'V': 've',
        'R': 'er',
        'L': 'el',
    }

    result = text

    # 1. Sonlar yonidagi harflarni almashtirish (masalan: 3x -> 3 iks, 2y -> 2 igrek)
    for var, phonetic in math_vars.items():
        result = re.sub(rf'(\d)({re.escape(var)})(?!\w)', rf'\1 {phonetic}', result)

    # 2. Yakka turgan harflarni almashtirish (masalan: "x ning" -> "iks ning", "x = 45" -> "iks = 45")
    for var, phonetic in math_vars.items():
        result = re.sub(rf'(?<!\w){re.escape(var)}(?!\w)', phonetic, result)

    # 3. Matematik kontekstdagi katta harflar (faqat son yoki = belgisi yonida kelganda)
    for var, phonetic in math_symbols.items():
        # Masalan: "S = 150" -> "es = 150", "P = 2*(a+b)" -> "pe = 2*(a+be)"
        result = re.sub(rf'(?<!\w){re.escape(var)}(?=\s*[=<>])', phonetic, result)

    return result


def latin_to_cyrillic(text: str) -> str:
    """
    O'zbek lotin alifbosidagi matnni kirill alifbosiga o'tkazadi (MMS-TTS kirill yozuvida yaxshi ishlaydi).
    """
    # Harflar juftligi (Order matters: longer combinations first)
    replacements = {
        # Bo'g'inlar va qo'shaloq harflar
        "yo'": "yo'", # o' harfi bilan kelganda alohida
        "Yo'": "Yo'",
        "sh": "ш", "Sh": "Ш", "SH": "Ш",
        "ch": "ч", "Ch": "Ч", "CH": "Ч",
        "o'": "ў", "O'": "Ў", "o`": "ў", "O`": "Ў", "g'": "ғ", "G'": "Ғ", "g`": "ғ", "G`": "Ғ",
        "ya": "я", "Ya": "Я", "YA": "Я",
        "yu": "ю", "Yu": "Ю", "YU": "Ю",
        "yo": "ё", "Yo": "Ё", "YO": "Ё",
        "ye": "е", "Ye": "Е", "YE": "Е",
        
        # Unli va undosh harflar
        "a": "а", "A": "А",
        "b": "б", "B": "Б",
        "d": "д", "D": "Д",
        "e": "э", "E": "Э", # So'z boshidagi Ye/E masalasi uchun sodda yechim
        "f": "ф", "F": "Ф",
        "g": "г", "G": "Г",
        "h": "ҳ", "H": "Ҳ",
        "i": "и", "I": "И",
        "j": "ж", "J": "Ж",
        "k": "к", "K": "К",
        "l": "л", "L": "Л",
        "m": "м", "M": "М",
        "n": "н", "N": "Н",
        "o": "о", "O": "О",
        "p": "п", "P": "П",
        "q": "қ", "Q": "Қ",
        "r": "р", "R": "Р",
        "s": "с", "S": "С",
        "t": "т", "T": "Т",
        "u": "у", "U": "У",
        "v": "в", "V": "В",
        "x": "х", "X": "Х",
        "y": "й", "Y": "Й",
        "z": "з", "Z": "З",
        "'": "ъ" # Tutuq belgisi
    }
    
    # Ye harfi so'z boshida kelsa "е" (ye) bo'ladi, so'z o'rtasida e -> э.
    # Lekin soddalik uchun quyidagi regex ishlatamiz:
    
    # Avval bosh harflar va bo'g'inlarni o'zgartiramiz
    res = text
    
    # So'z boshidagi 'E' -> 'Э' va 'e' -> 'э'
    res = re.sub(r'\b[Ee]', lambda m: 'Э' if m.group(0).isupper() else 'э', res)
    
    for lat, cyr in replacements.items():
        res = res.replace(lat, cyr)
        
    return res

def normalize_language(lang: str) -> str:
    """
    LLM qaytargan til matnini standard 'uz', 'ru', 'en' kodlariga o'tkazadi.
    """
    if not lang:
        return "uz"
    lang = lang.lower().strip()
    if "uz" in lang or "o'z" in lang or "oz" in lang or "kiril" in lang:
        return "uz"
    elif "ru" in lang or "rus" in lang:
        return "ru"
    elif "en" in lang or "eng" in lang or "english" in lang:
        return "en"
    return "uz"  # default fallback

if __name__ == "__main__":
    test_text = "Salom, mening ismim Botir. Uchburchakning tomonlari besh, yetti va sakkiz. Perimetrni toping."
    print("Original:", test_text)
    print("Cyrillic:", latin_to_cyrillic(test_text))
    print("Normalized Language 'O'zbek tili':", normalize_language("O'zbek tili"))


def number_to_words_uz(n: int) -> str:
    if n == 0:
        return "nol"
    
    ones = ["", "bir", "ikki", "uch", "to'rt", "besh", "olti", "yetti", "sakkiz", "to'qqiz"]
    tens = ["", "o'n", "yigirma", "o'ttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "to'qson"]
    
    def _convert_group(num: int) -> str:
        parts = []
        h = num // 100
        t = (num % 100) // 10
        o = num % 10
        if h > 0:
            if h > 1:
                parts.append(ones[h] + " yuz")
            else:
                parts.append("yuz")
        if t > 0:
            parts.append(tens[t])
        if o > 0:
            parts.append(ones[o])
        return " ".join(filter(None, parts))

    if n < 1000:
        return _convert_group(n)
    else:
        thousands = n // 1000
        remainder = n % 1000
        th_word = _convert_group(thousands) + " ming" if thousands > 1 else "ming"
        if remainder > 0:
            return th_word + " " + _convert_group(remainder)
        return th_word


def replace_numbers_with_words(text: str) -> str:
    """
    Matn ichidagi barcha sonlarni, butun va o'nli kasrlarni, o'lchov birliklarini
    va matematik belgilarni o'zbekcha yozma ko'rinishiga o'tkazadi.
    Masalan: "153.86 sm^2" -> "yuz ellik uch butun sakson olti kvadrat santimetr"
    """
    # Normalize unicode superscripts to standard carets
    res = text.replace('²', '^2').replace('³', '^3')
    
    # Matematik va fizik o'lchov birliklari / doimiylari
    res = re.sub(r'\\text\{\s*sm\s*\}\^2|sm\^2', ' kvadrat santimetr ', res)
    res = re.sub(r'\\text\{\s*m\s*\}\^2|m\^2', ' kvadrat metr ', res)
    res = re.sub(r'\\text\{\s*sm\s*\}|\bsm\b', ' santimetr ', res)
    res = re.sub(r'\\text\{\s*m\s*\}|\bm\b', ' metr ', res)
    res = re.sub(r'\bkg\b', ' kilogramm ', res)
    res = re.sub(r'\\pi\b|π|∏|Π|\bpi\b|\bPI\b', ' pi-soni ', res)
    res = re.sub(r'%', ' foiz ', res)
    
    # Matematik amallar
    res = re.sub(r' \+ | \+|^[+]|[+]$', ' qo\'shuv ', res)
    res = re.sub(r' - | -|^[-]|[-]$', ' ayruv ', res)
    res = re.sub(r' = |=', ' teng ', res)
    res = re.sub(r' \* | \*|^[*]|[*]| • ', ' ko\'paytiruv ', res)
    res = re.sub(r' / | /|^[/]|[/]', ' bo\'luv ', res)
    
    # Darajalar (powers/exponents): e.g. 10^2 yoki 10^{2} -> "o'nning kvadrati"
    def repl_power(match):
        base = int(match.group(1))
        exponent = int(match.group(2))
        base_words = number_to_words_uz(base)
        exponent_words = number_to_words_uz(exponent)
        
        if exponent == 2:
            return f" {base_words}ning kvadrati "
        elif exponent == 3:
            return f" {base_words}ning kubi "
        else:
            return f" {base_words} darajasi {exponent_words} "

    res = re.sub(r'\b(\d+)\^\{?(\d+)\}?\b', repl_power, res)

    # O'nli kasrlar (decimals: e.g. 153.86 or 153,86)
    def repl_decimal(match):
        parts = re.split(r'[\.,]', match.group(0))
        int_val = int(parts[0])
        frac_val = int(parts[1])
        return f" {number_to_words_uz(int_val)} butun {number_to_words_uz(frac_val)} "
        
    res = re.sub(r'\b\d+[\.,]\d+\b', repl_decimal, res)
    
    # Butun sonlar (integers)
    def repl_integer(match):
        val = int(match.group(0))
        if val <= 999999:
            return number_to_words_uz(val)
        return match.group(0)
        
    res = re.sub(r'\b\d+\b', repl_integer, res)
    
    # Ikki tomonlama ortiqcha bo'shliqlarni yo'qotish
    res = re.sub(r'\s+', ' ', res).strip()
    return res


