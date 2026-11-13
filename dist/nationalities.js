// Approved nationalities, synchronized 2026-11-10. Both genders share effects.
export const NATIONALITY_VERSION=1;
export const NATIONALITIES={
  "nizhny_mechanic": {
    "id": "nizhny_mechanic",
    "nationality": "Нижегородец: механик",
    "male": "Никита",
    "female": "Анастасия",
    "description": "Интеллект +1. Шанс качества Цеха и Стрелкового +5 п.п. Точность с оружием своего производства +5 п.п.",
    "restriction": "Восприятие −1. Точность с покупным оружием −10 п.п.",
    "startDescription": "Нет",
    "headwear": "cap",
    "bonuses": {
      "attributes": {
        "intelligence": 1,
        "perception": -1
      },
      "quality": {
        "melee": 5,
        "ranged": 5
      },
      "craftedAccuracy": 5,
      "boughtAccuracy": -10
    }
  },
  "neva_experimenter": {
    "id": "neva_experimenter",
    "nationality": "Невский экспериментатор",
    "male": "Тимофей",
    "female": "Софья",
    "description": "Положительные эффекты любых стимуляторов сильнее на 50%.",
    "restriction": "Максимум HP −40. Усиление не складывается с аналогичным профессиональным эффектом.",
    "startDescription": "Боевой стимулятор, который добавляет 40Нр и +5% точности",
    "headwear": "beret",
    "bonuses": {
      "hp": -40,
      "stimulantPercent": 50,
      "startItems": [
        {
          "item": "combatStimulator",
          "qty": 1
        }
      ]
    }
  },
  "petersburg_dreamer": {
    "id": "petersburg_dreamer",
    "nationality": "Петербуржец: мечтатель",
    "male": "Лев",
    "female": "Лилия",
    "description": "Одно дополнительное очко выбора перка при найме. Интеллект +1.",
    "restriction": "Восприятие −1. Максимум HP −30.",
    "startDescription": "Дополнительное очко перка ×1",
    "headwear": "beret",
    "bonuses": {
      "attributes": {
        "intelligence": 1,
        "perception": -1
      },
      "hp": -30,
      "extraPerks": 1
    }
  },
  "butovo_trickster": {
    "id": "butovo_trickster",
    "nationality": "Бутово: ловкач",
    "male": "Дэг",
    "female": "Верка",
    "description": "Ловкость +1. Инициатива +2. Первая атака вплотную в каждом бою получает +5 п.п. точности.",
    "restriction": "Интеллект −1. Восприятие −1.",
    "startDescription": "Нет",
    "headwear": "bandana",
    "bonuses": {
      "attributes": {
        "agility": 1,
        "intelligence": -1,
        "perception": -1
      },
      "initiative": 2,
      "firstMeleeAccuracy": 5
    }
  },
  "moscow_city_patron": {
    "id": "moscow_city_patron",
    "nationality": "Москва-Сити: наследник",
    "male": "Глеб",
    "female": "Кира",
    "description": "Дополнительное очко выбора перка при найме. и 200А на старте",
    "restriction": "Восприятие −1. Денежная награда вылазок −10%.",
    "startDescription": "200 A и дополнительное очко перка ×1",
    "headwear": "topHat",
    "bonuses": {
      "attributes": {
        "perception": -1
      },
      "extraPerks": 1,
      "startMoney": 2000,
      "questMoneyPercent": -10
    }
  },
  "kazan_craftsman": {
    "id": "kazan_craftsman",
    "nationality": "Казань: умелец",
    "male": "Рустам",
    "female": "Алия",
    "description": "Восприятие +1. Шанс качества Медицина и Брони +5 п.п.",
    "restriction": "Сила −1.",
    "startDescription": "50 A",
    "headwear": "roundcap",
    "bonuses": {
      "attributes": {
        "perception": 1,
        "strength": -1
      },
      "quality": {
        "medicine": 5,
        "armor": 5
      },
      "startMoney": 500
    }
  },
  "murmansk_captain": {
    "id": "murmansk_captain",
    "nationality": "Мурманск: капитан",
    "male": "Андрей",
    "female": "Марина",
    "description": "Восприятие +1. Термическое поглощение +20. После потери не менее 20% HP в бою: +5% п.п. точности до конца боя.",
    "restriction": "Ловкость −1. Уклонение −5 п.п.",
    "startDescription": "Нет",
    "headwear": "sailor",
    "bonuses": {
      "attributes": {
        "agility": -1,
        "perception": 1
      },
      "thermalArmor": 20,
      "battleWoundAccuracy": 5,
      "evasion": -5
    },
    "balanceRevision": 2
  },
  "saratov_diplomat": {
    "id": "saratov_diplomat",
    "nationality": "Саратов: дипломат",
    "male": "Станислав",
    "female": "Виолетта",
    "description": "A от НПЦ квестов +15%. Цена покупки предметов у НПЦ и торговцев −10%.",
    "restriction": "Точность оружия −5 п.п.",
    "startDescription": "Нет",
    "headwear": "flatcap",
    "bonuses": {
      "buyPercent": -10,
      "accuracy": -5,
      "npcQuestPercent": 15
    },
    "balanceRevision": 2
  },
  "volgograd_farmer": {
    "id": "volgograd_farmer",
    "nationality": "Волгоград: фермер",
    "male": "Тихон",
    "female": "Дарья",
    "description": "Все производства Еды +10% качества и фермы на станции будут производить на 15% больше доходов и результатов.",
    "restriction": "Ловкость −1.",
    "startDescription": "Крысиный отвар ×1",
    "headwear": "straw",
    "bonuses": {
      "attributes": {
        "agility": -1
      },
      "foodQuality": 10,
      "farmPercent": 15,
      "startItems": [
        {
          "item": "broth",
          "qty": 1
        }
      ]
    }
  },
  "krasnodar_athlete": {
    "id": "krasnodar_athlete",
    "nationality": "Краснодар: спортсмен",
    "male": "Виктор",
    "female": "Валерия",
    "description": "Максимум HP +30. Одна дополнительная атака основным оружием в первом ходе боя в одну вылазку.",
    "restriction": "Интеллект −1. Точность на дистанции 1 и более −5 п.п.",
    "startDescription": "Нет",
    "headwear": "headband",
    "bonuses": {
      "hp": 30,
      "attributes": {
        "intelligence": -1
      },
      "openingExtraAttack": 1,
      "distantAccuracy": -5
    }
  },
  "ufa_researcher": {
    "id": "ufa_researcher",
    "nationality": "Уфа: исследователь",
    "male": "Артур",
    "female": "Элина",
    "description": "Интеллект +1. Энергетическое оружие, или огнемёты: +10 п.п. точности и +20 урона.",
    "restriction": "Восприятие −1. Обычное огнестрельное оружие: −10 п.п. точности.",
    "startDescription": "Нет",
    "headwear": "beanie",
    "bonuses": {
      "attributes": {
        "intelligence": 1,
        "perception": -1
      },
      "energyAccuracy": 10,
      "energyDamage": 20,
      "firearmAccuracy": -10
    }
  },
  "ural_brawler": {
    "id": "ural_brawler",
    "nationality": "Урал: забияка",
    "male": "И-горь",
    "female": "Татьишка",
    "description": "Сила +1. Физическое поглощение +10.",
    "restriction": "Точность всех атак −5 п.п.",
    "startDescription": "Нет",
    "headwear": "ushanka",
    "bonuses": {
      "attributes": {
        "strength": 1
      },
      "armor": 10,
      "accuracy": -5
    }
  },
  "tula_gunsmith": {
    "id": "tula_gunsmith",
    "nationality": "Тула: оружейник",
    "male": "Семён",
    "female": "Ульяна",
    "description": "Шанс успеха Оружейного дела +5 п.п. Пистолеты: +5 п.п. точности.",
    "restriction": "Шанс качества Науки −5 п.п.",
    "startDescription": "Ашот +1 в инвентарь",
    "headwear": "cap",
    "bonuses": {
      "success": {
        "upgrade": 5
      },
      "pistolAccuracy": 5,
      "quality": {
        "science": -5
      },
      "startItems": [
        {
          "item": "ashot",
          "qty": 1,
          "quality": 1
        }
      ]
    }
  },
  "novosibirsk_academic": {
    "id": "novosibirsk_academic",
    "nationality": "Новосибирск: академик",
    "male": "Михаил",
    "female": "Катерина",
    "description": "Интеллект +1. Шанс успеха Науки +5 п.п. и качетво Медицины +5 п.п.",
    "restriction": "Восприятие −1. На старте Облучён (4).",
    "startDescription": "Нет",
    "headwear": "cap",
    "bonuses": {
      "attributes": {
        "intelligence": 1,
        "perception": -1
      },
      "success": {
        "science": 5
      },
      "quality": {
        "medicine": 5
      },
      "radiation": 4
    }
  },
  "tajik_builder": {
    "id": "tajik_builder",
    "nationality": "Таджикистан: строитель",
    "male": "Фарид",
    "female": "Шабнам",
    "description": "Ловкость +1. Награды квестов станции +100%, стоимость построек станции -30%",
    "restriction": "Интеллект −1. Восприятие −1.",
    "startDescription": "Нет",
    "headwear": "roundcap",
    "bonuses": {
      "attributes": {
        "agility": 1,
        "intelligence": -1,
        "perception": -1
      },
      "npcQuestPercent": 100,
      "buildingPercent": -30
    }
  },
  "uzbek_assistant": {
    "id": "uzbek_assistant",
    "nationality": "Узбекистан: помощник",
    "male": "Бахтиёр",
    "female": "Нулуфа",
    "description": "Сила +1. Дополнительное очко перка при найме. бонус 50А",
    "restriction": "Интеллект −1, получаемый опыт -10%",
    "startDescription": "Дополнительное очко перка ×1",
    "headwear": "roundcap",
    "bonuses": {
      "attributes": {
        "strength": 1,
        "intelligence": -1
      },
      "extraPerks": 1,
      "startMoney": 500,
      "xpPenalty": 10
    },
    "balanceRevision": 2
  },
  "baikal_firekeeper": {
    "id": "baikal_firekeeper",
    "nationality": "Байкал: хранитель огня",
    "male": "Бато",
    "female": "Саяна",
    "description": "Любой термический урон героя +30 до поглощения, включая гранаты.",
    "restriction": "Термическое поглощение −30; допускается уязвимость ниже нуля.",
    "startDescription": "Нет",
    "headwear": "fur",
    "bonuses": {
      "thermalDamage": 30,
      "thermalArmor": -30
    }
  },
  "azerbaijan_trader": {
    "id": "azerbaijan_trader",
    "nationality": "Азербайджан: торговец",
    "male": "Эльдар",
    "female": "Лейла",
    "description": "Продажа предметов +10%.",
    "restriction": "Инициатива −2.",
    "startDescription": "30 A",
    "headwear": "flatcap",
    "bonuses": {
      "salePercent": 10,
      "initiative": -2,
      "startMoney": 300
    }
  },
  "siberian_tracker": {
    "id": "siberian_tracker",
    "nationality": "Сибирь: следопыт",
    "male": "Данила",
    "female": "Полина",
    "description": "Урон против зверей и мутантов +20. Лечение расходником +10 HP.",
    "restriction": "Интеллект −1. Дополнительная плата за найм 50A (может сделать А отрицательным) ",
    "startDescription": "Нет",
    "headwear": "ushanka",
    "bonuses": {
      "attributes": {
        "intelligence": -1
      },
      "mutantDamage": 20,
      "medicineBonus": 10,
      "hireDebt": 500
    }
  },
  "kamchatka_survivor": {
    "id": "kamchatka_survivor",
    "nationality": "Камчатка: выживальщик",
    "male": "Максим",
    "female": "Арина",
    "description": "Максимум HP +30. Термическое поглощение +10. Защита РАД +2.",
    "restriction": "Интеллект −2.",
    "startDescription": "Нет",
    "headwear": "beanie",
    "bonuses": {
      "attributes": {
        "intelligence": -2
      },
      "hp": 30,
      "thermalArmor": 10,
      "radiationProtection": 2
    }
  },
  "usa_survivor": {
    "id": "usa_survivor",
    "nationality": "США: выживальщик",
    "male": "Джек",
    "female": "Джесс",
    "description": "После успешной боевой вылазки с хотя бы одним побеждённым врагом получает 5 A + 1 A за уровень.",
    "restriction": "Максимум HP −20.",
    "startDescription": "Старые бинты ×2",
    "headwear": "cap",
    "bonuses": {
      "hp": -20,
      "combatMoneyBase": 50,
      "combatMoneyLevel": 10,
      "startItems": [
        {
          "item": "bandage",
          "qty": 2
        }
      ]
    }
  },
  "usa_cowboy": {
    "id": "usa_cowboy",
    "nationality": "США: ковбой",
    "male": "Уильям",
    "female": "Джейн",
    "description": "Пистолеты: +5 п.п. точности и +10 урона.",
    "restriction": "Остальное оружие: −10 п.п. точности.",
    "startDescription": "Нет",
    "headwear": "cowboy",
    "bonuses": {
      "pistolAccuracy": 5,
      "pistolDamage": 10,
      "otherWeaponAccuracy": -10
    }
  },
  "english_detective": {
    "id": "english_detective",
    "nationality": "Англия: сыщик",
    "male": "Оливер",
    "female": "Элис",
    "description": "Интеллект +1. Проверки обнаружения врагов, добычи и ловушек +2.",
    "restriction": "Максимум HP −30. Покупка у НПЦ на 10% дороже.",
    "startDescription": "Нет",
    "headwear": "flatcap",
    "bonuses": {
      "attributes": {
        "intelligence": 1
      },
      "detectionBonus": 2,
      "lootBonus": 2,
      "trapBonus": 2,
      "hp": -30,
      "buyPercent": 10
    }
  },
  "english_gentleman": {
    "id": "english_gentleman",
    "nationality": "Англия: джентльмен",
    "male": "Эдвард",
    "female": "Элеонора",
    "description": "Восприятие +1. Точность всех атак +5 п.п.",
    "restriction": "Инициатива −4. Уклонение −5 п.п.",
    "startDescription": "Нет",
    "headwear": "topHat",
    "bonuses": {
      "attributes": {
        "perception": 1
      },
      "accuracy": 5,
      "initiative": -4,
      "evasion": -5
    }
  },
  "arab_skirmisher": {
    "id": "arab_skirmisher",
    "nationality": "Арабский шайтан",
    "male": "Халид",
    "female": "Надия",
    "description": "Ловкость +1. Точность ближнего оружия +5 п.п., урон ближнего +10",
    "restriction": "Интеллект −2.",
    "startDescription": "Нет",
    "headwear": "wrap",
    "bonuses": {
      "attributes": {
        "agility": 1,
        "intelligence": -2
      },
      "meleeAccuracy": 5,
      "meleeDamage": 10
    }
  },
  "arab_demolitionist": {
    "id": "arab_demolitionist",
    "nationality": "Арабский подрывник",
    "male": "Самир",
    "female": "Сальма",
    "description": "Урон всех гранат +30 до поглощения.",
    "restriction": "Граната взрывается под ногами с вероятностью 10% вместо 5%.",
    "startDescription": "Трубная граната ×1",
    "headwear": "bandana",
    "bonuses": {
      "grenadeDamage": 30,
      "grenadeSelfChance": 10,
      "startItems": [
        {
          "item": "pipeGrenade",
          "qty": 1
        }
      ]
    }
  },
  "afroamerican_explorer": {
    "id": "afroamerican_explorer",
    "nationality": "Афроамериканец",
    "male": "Ачол",
    "female": "Наоми",
    "description": "Физическое поглощение +15. Проверки поиска добычи +1.",
    "restriction": "Интеллект -1",
    "startDescription": "Нет",
    "headwear": "cap",
    "bonuses": {
      "armor": 15,
      "lootBonus": 1,
      "attributes": {
        "intelligence": -1
      }
    }
  },
  "belarus_stalwart": {
    "id": "belarus_stalwart",
    "nationality": "Беларусь: крепыш",
    "male": "Алеша",
    "female": "Леська",
    "description": "Максимум HP +50 на старте и ещё +8 за каждый уровень после первого.",
    "restriction": "Всё лечение и отдых для него -20% эффективности",
    "startDescription": "Нет",
    "headwear": "ushanka",
    "bonuses": {
      "hp": 50,
      "hpPerLevel": 8,
      "healingPercent": -20
    },
    "balanceRevision": 2
  },
  "brazil_footballer": {
    "id": "brazil_footballer",
    "nationality": "Бразилия: футболист",
    "male": "Рафаэл",
    "female": "Камила",
    "description": "В каждом бою стартовая дистанция на 1 больше. Уклонение +5 п.п.",
    "restriction": "Дистанционное оружие: −5 п.п. точности.",
    "startDescription": "Нет",
    "headwear": "headband",
    "bonuses": {
      "startingDistance": 1,
      "evasion": 5,
      "rangedAccuracy": -5
    }
  },
  "greek_talent": {
    "id": "greek_talent",
    "nationality": "Греция: талант",
    "male": "Никос",
    "female": "Елена",
    "description": "Дополнительные очки выбора перка 1 при найме и 1 на 3тьем ур.",
    "restriction": "Ловкость −1. Стартовый максимум HP −15.",
    "startDescription": "Одно очко перка при найме, ещё одно при достижении 3-го уровня.",
    "headwear": "flatcap",
    "bonuses": {
      "attributes": {
        "agility": -1
      },
      "hp": -15,
      "extraPerks": 1,
      "perkMilestones": {
        "3": 1
      }
    },
    "balanceRevision": 2
  },
  "jewish_family": {
    "id": "jewish_family",
    "nationality": "Еврей: заботливая семья",
    "male": "Иосиф",
    "female": "Рахель",
    "description": "Если герой за всю вылазку ни разу не опускался ниже 2/3 доступного HP, при успехе получает 5 A + 2 A за уровень.",
    "restriction": "Максимум HP −30.",
    "startDescription": "Нет",
    "headwear": "roundcap",
    "bonuses": {
      "hp": -30,
      "safeMoneyBase": 50,
      "safeMoneyLevel": 20
    }
  },
  "jewish_merchant": {
    "id": "jewish_merchant",
    "nationality": "Еврей: торговец",
    "male": "Мойша",
    "female": "Саарэ",
    "description": "Покупка у НПЦ −10%. Продажа предметов +8%.",
    "restriction": "Точность −5 п.п.",
    "startDescription": "Нет",
    "headwear": "fedora",
    "bonuses": {
      "buyPercent": -10,
      "salePercent": 8,
      "accuracy": -5
    }
  },
  "egypt_sunwalker": {
    "id": "egypt_sunwalker",
    "nationality": "Египет: путник",
    "male": "Омар",
    "female": "Амина",
    "description": "На поверхности проверки Восприятия и скрытности +2",
    "restriction": "В подземных локациях эти проверки −1.",
    "startDescription": "Старые бинты ×1",
    "headwear": "wrap",
    "bonuses": {
      "surfaceChecks": 2,
      "undergroundChecks": -1,
      "startItems": [
        {
          "item": "bandage",
          "qty": 1
        }
      ]
    }
  },
  "india_yogi": {
    "id": "india_yogi",
    "nationality": "Индия: йог",
    "male": "Арун",
    "female": "Пурия",
    "description": "Ловкость +1. Лечение медикаментами на 20% эффективнее.",
    "restriction": "Точность −5 п.п. Урон оружия −5",
    "startDescription": "Старые бинты ×1",
    "headwear": "wrap",
    "bonuses": {
      "attributes": {
        "agility": 1
      },
      "medicinePercent": 20,
      "accuracy": -5,
      "weaponDamage": -5,
      "startItems": [
        {
          "item": "bandage",
          "qty": 1
        }
      ]
    }
  },
  "spain_dancer": {
    "id": "spain_dancer",
    "nationality": "Испания: танцор",
    "male": "Диего",
    "female": "Лусия",
    "description": "Инициатива +4. После первого полученного урона в бою уклонение +5 п.п. до конца боя.",
    "restriction": "Максимум HP −30.",
    "startDescription": "Нет",
    "headwear": "beret",
    "bonuses": {
      "initiative": 4,
      "woundedEvasion": 5,
      "hp": -30
    }
  },
  "spain_gambler": {
    "id": "spain_gambler",
    "nationality": "Испания: азартный",
    "male": "Хавьер",
    "female": "Кармен",
    "description": "Один раз за бой после промаха врага вплотную делает ответную атаку основным оружием.",
    "restriction": "Точность всех атак −5 п.п.",
    "startDescription": "Нет",
    "headwear": "fedora",
    "bonuses": {
      "counterOnMiss": true,
      "accuracy": -5
    }
  },
  "italy_vendetta": {
    "id": "italy_vendetta",
    "nationality": "Италия: вендетта",
    "male": "Лоренцо",
    "female": "Виттория",
    "description": "Против врага, который уже ранил героя в этом бою: +10 п.п. точности и +10 урона.",
    "restriction": "Против остальных целей точность −5 п.п.",
    "startDescription": "Нет",
    "headwear": "fedora",
    "bonuses": {
      "vendettaAccuracy": 10,
      "vendettaDamage": 10,
      "unwoundedAccuracy": -5
    }
  },
  "italy_quick": {
    "id": "italy_quick",
    "nationality": "Италия: стремительный",
    "male": "Маттео",
    "female": "Кьяра",
    "description": "Одна дополнительная атака основным оружием в первом бою на своём ходу один раз за вылазку.",
    "restriction": "Максимум HP −40. Получаемый опыт -10%",
    "startDescription": "Нет",
    "headwear": "cap",
    "bonuses": {
      "openingExtraAttack": 1,
      "hp": -40,
      "xpPenalty": 10
    }
  },
  "china_endurance": {
    "id": "china_endurance",
    "nationality": "Китай: выносливый",
    "male": "Вэй",
    "female": "Мэй",
    "description": "Максимум HP +40. Ловкость +1. Восприятие +1. Каждый лимит носимой расходки +2.",
    "restriction": "Сила −1 Получаемый опыт -10%",
    "startDescription": "Нет",
    "headwear": "straw",
    "bonuses": {
      "hp": 40,
      "attributes": {
        "agility": 1,
        "perception": 1,
        "strength": -1
      },
      "supplyLimit": 2,
      "xpPenalty": 10
    },
    "balanceRevision": 2
  },
  "china_kungfu": {
    "id": "china_kungfu",
    "nationality": "Китай: кун-фу",
    "male": "Лян",
    "female": "Линь",
    "description": "Уклонение +10 п.п. Ближнее оружие: +7 урона.",
    "restriction": "Сила −1. Огнестрельное оружие: −5 п.п. точности.",
    "startDescription": "Нет",
    "headwear": "headband",
    "bonuses": {
      "evasion": 10,
      "meleeDamage": 7,
      "attributes": {
        "strength": -1
      },
      "firearmAccuracy": -5
    }
  },
  "korea_prepared": {
    "id": "korea_prepared",
    "nationality": "КНДР: подготовленный",
    "male": "Чхоль",
    "female": "Ынхи",
    "description": "Точность +5 п.п. Максимум HP +40. Физическое и термическое поглощение +10. Защита РАД +1",
    "restriction": "Сила −1, Получаемый опыт -10%",
    "startDescription": "Нет",
    "headwear": "cap",
    "bonuses": {
      "accuracy": 5,
      "hp": 40,
      "armor": 10,
      "thermalArmor": 10,
      "radiationProtection": 1,
      "attributes": {
        "strength": -1
      },
      "xpPenalty": 10
    },
    "balanceRevision": 2
  },
  "latin_adventurer": {
    "id": "latin_adventurer",
    "nationality": "Латинос",
    "male": "Карлос",
    "female": "Изабель",
    "description": "Покупка −5%, продажа +5%. Проверки поиска добычи +2",
    "restriction": "Максимум HP −30. Восприятие −1.",
    "startDescription": "50 A",
    "headwear": "bandana",
    "bonuses": {
      "buyPercent": -5,
      "salePercent": 5,
      "lootBonus": 2,
      "hp": -30,
      "attributes": {
        "perception": -1
      },
      "startMoney": 500
    }
  },
  "mexico_musician": {
    "id": "mexico_musician",
    "nationality": "Мексика: музыкант",
    "male": "Мигель",
    "female": "Долорес",
    "description": "Пистолеты на дистанциях 0 и 1: +10 п.п. точности.",
    "restriction": "Другое оружие: −5 п.п. точности. Дополнительная плата за найм 80 A",
    "startDescription": "Нет",
    "headwear": "cowboy",
    "bonuses": {
      "closePistolAccuracy": 10,
      "otherWeaponAccuracy": -5,
      "hireCost": 800
    }
  },
  "mongolia_destroyer": {
    "id": "mongolia_destroyer",
    "nationality": "Монгол разрушитель",
    "male": "Бат",
    "female": "Саруул",
    "description": "Урон стрелкового оружия и гранат +20.",
    "restriction": "Инициатива −2. Точность −10 п.п.",
    "startDescription": "Нет",
    "headwear": "fur",
    "bonuses": {
      "rangedDamage": 20,
      "grenadeDamage": 20,
      "initiative": -2,
      "accuracy": -10
    }
  },
  "freed_prisoner": {
    "id": "freed_prisoner",
    "nationality": "Африканец пленник",
    "male": "Джамал",
    "female": "Аиша",
    "description": "Сила +1. Физическое и термическое поглощение +10.",
    "restriction": "Интеллект −1. Восприятие −1. Получаемый опыт -15%",
    "startDescription": "Нет",
    "headwear": "beanie",
    "bonuses": {
      "attributes": {
        "strength": 1,
        "intelligence": -1,
        "perception": -1
      },
      "armor": 10,
      "thermalArmor": 10,
      "xpPenalty": 15
    }
  },
  "germany_traditionalist": {
    "id": "germany_traditionalist",
    "nationality": "Германия: Каска",
    "male": "Отто",
    "female": "Грета",
    "description": "Крит. урон по герою снижается на 20%",
    "restriction": "Инициатива −2.",
    "startDescription": "Нет",
    "headwear": "cap",
    "bonuses": {
      "criticalDamageReductionPercent": 20,
      "initiative": -2
    }
  },
  "germany_engineer": {
    "id": "germany_engineer",
    "nationality": "Германия: мастер",
    "male": "Фридрих",
    "female": "Хильда",
    "description": "Максимум HP +30. Шанс успеха Оружейного дела +7 п.п. Шанс качества Цеха и Стрелкового +5 п.п.",
    "restriction": "Денежная награда вылазок −20%. Дополнительная плата за найм 50 A.",
    "startDescription": "Нет",
    "headwear": "cap",
    "bonuses": {
      "hp": 30,
      "success": {
        "upgrade": 7
      },
      "quality": {
        "melee": 5,
        "ranged": 5
      },
      "questMoneyPercent": -20,
      "hireCost": 500
    }
  },
  "norway_berserk": {
    "id": "norway_berserk",
    "nationality": "Норвегия: берсерк",
    "male": "Эрик",
    "female": "Фрейя",
    "description": "Каждое попадание врага по герою даёт +5 урона до конца боя, максимум +30.",
    "restriction": "Уклонение −5 п.п.",
    "startDescription": "Нет",
    "headwear": "beanie",
    "bonuses": {
      "berserkOnHit": 5,
      "berserkCap": 30,
      "evasion": -5
    }
  },
  "portugal_sailor": {
    "id": "portugal_sailor",
    "nationality": "Португалия: моряк",
    "male": "Тьягу",
    "female": "Инеш",
    "description": "Сила +1. Точность любого оружия +5 п.п.",
    "restriction": "Проверки поиска добычи −2. Дополнительная плата за найм 40 A.",
    "startDescription": "Нет",
    "headwear": "sailor",
    "bonuses": {
      "attributes": {
        "strength": 1
      },
      "accuracy": 5,
      "lootBonus": -2,
      "hireCost": 400
    }
  },
  "russian_pilgrim": {
    "id": "russian_pilgrim",
    "nationality": "Русский паломник",
    "male": "Фёдор",
    "female": "Евдокия",
    "description": "Максимум HP +20 и ещё +15 за уровень после первого.",
    "restriction": "Точность оружия −5 п.п., Максимум расходок уменьшается на 3.",
    "startDescription": "Нет",
    "headwear": "beanie",
    "bonuses": {
      "hp": 20,
      "hpPerLevel": 15,
      "accuracy": -5,
      "supplyLimit": -3
    }
  },
  "nigeria_tracker": {
    "id": "nigeria_tracker",
    "nationality": "Нигерия: следопыт",
    "male": "Кофе",
    "female": "Н-нека",
    "description": "Сила, Ловкость и Восприятие +1. Максимум HP +40 и ещё +10 за уровень после первого. Защита РАД +2.",
    "restriction": "Интеллект −2. Точность огнестрельного оружия −10 п.п. получаемый опыт -10%",
    "startDescription": "Нет",
    "headwear": "wrap",
    "bonuses": {
      "attributes": {
        "strength": 1,
        "agility": 1,
        "perception": 1,
        "intelligence": -2
      },
      "hp": 40,
      "hpPerLevel": 10,
      "radiationProtection": 2,
      "firearmAccuracy": -10,
      "xpPenalty": 10
    }
  },
  "poland_risk": {
    "id": "poland_risk",
    "nationality": "Польша: рисковый",
    "male": "Петро",
    "female": "Зофья",
    "description": "Восприятие +1. Шанс критического попадания +5 п.п.",
    "restriction": "Интеллект −1. Шанс уронить гранату под ноги — 10%.",
    "startDescription": "Нет",
    "headwear": "cap",
    "bonuses": {
      "attributes": {
        "perception": 1,
        "intelligence": -1
      },
      "criticalBonus": 5,
      "grenadeSelfChance": 10
    }
  },
  "indigenous_scout": {
    "id": "indigenous_scout",
    "nationality": "Потомок коренных американцев: разведчик",
    "male": "Такая",
    "female": "Айяна",
    "description": "Уклонение +5 п.п. Обнаружение ловушек +2. Уклонение от гранат +2 к броску.",
    "restriction": "Огнестрельное оружие: −5 п.п. точности.",
    "startDescription": "Трубная граната ×1",
    "headwear": "feathers",
    "bonuses": {
      "evasion": 5,
      "trapBonus": 2,
      "grenadeDodge": 2,
      "firearmAccuracy": -5,
      "startItems": [
        {
          "item": "pipeGrenade",
          "qty": 1
        }
      ]
    }
  },
  "soviet_veteran": {
    "id": "soviet_veteran",
    "nationality": "Советский ветеран",
    "male": "Григорий",
    "female": "Зинаида",
    "description": "Первый полученный урон в каждом бою уменьшается на 15. Точность оружия +5 п.п.",
    "restriction": "Инициатива −4",
    "startDescription": "ТТ +1",
    "headwear": "ushanka",
    "bonuses": {
      "firstDamageReduction": 15,
      "accuracy": 5,
      "initiative": -4,
      "startItems": [
        {
          "item": "pistol",
          "qty": 1
        }
      ]
    }
  },
  "yakut_hunter": {
    "id": "yakut_hunter",
    "nationality": "Якутия: охотник",
    "male": "Айтал",
    "female": "Сардана",
    "description": "Проверки скрытности и ловушек +2. Винтовки и дробовики: +5 п.п. точности. Максимум HP +30.",
    "restriction": "Покупка у НПЦ на 10% дороже.",
    "startDescription": "Нет",
    "headwear": "fur",
    "bonuses": {
      "stealthBonus": 2,
      "trapBonus": 2,
      "longGunAccuracy": 5,
      "hp": 30,
      "buyPercent": 10
    }
  },
  "france_charmer": {
    "id": "france_charmer",
    "nationality": "Франция: обаятельный",
    "male": "Люк",
    "female": "Жюли",
    "description": "Покупка у NPC −10%. Кулдаун возвращения торговцев −20%.",
    "restriction": "Точность оружия −5 п.п.",
    "startDescription": "Нет",
    "headwear": "beret",
    "bonuses": {
      "buyPercent": -10,
      "merchantCooldownReduction": 20,
      "accuracy": -5
    }
  },
  "france_marksman": {
    "id": "france_marksman",
    "nationality": "Франция: стрелок",
    "male": "Пьер",
    "female": "Селин",
    "description": "Автоматы и винтовки у него: +5 п.п. точности и +10 урона.",
    "restriction": "Пистолеты и ближнее оружие: −10 п.п. точности.",
    "startDescription": "Нет",
    "headwear": "kepi",
    "bonuses": {
      "rifleAutomaticAccuracy": 5,
      "rifleAutomaticDamage": 10,
      "pistolMeleeAccuracy": -10
    }
  },
  "roma_trader": {
    "id": "roma_trader",
    "nationality": "Рома: торговец",
    "male": "Милан",
    "female": "Рада",
    "description": "Уклонение +5 п.п. Покупка −10%, продажа +10%.",
    "restriction": "Проверки поиска добычи −1. Получаемый опыт -15%",
    "startDescription": "Нет",
    "headwear": "fedora",
    "bonuses": {
      "evasion": 5,
      "buyPercent": -10,
      "salePercent": 10,
      "lootBonus": -1,
      "xpPenalty": 15
    }
  },
  "roma_finder": {
    "id": "roma_finder",
    "nationality": "Рома: находчивый",
    "male": "Даниэль",
    "female": "Людмила",
    "description": "Ловкость +1. После успешной боевой вылазки 20% шанс дополнительно принести один предмет из обычной добычи её локации.",
    "restriction": "Восприятие −1.",
    "startDescription": "Нет",
    "headwear": "bandana",
    "bonuses": {
      "attributes": {
        "agility": 1,
        "perception": -1
      },
      "extraLootChance": 20
    }
  },
  "swiss_precise": {
    "id": "swiss_precise",
    "nationality": "Швейцария: точный",
    "male": "Леон",
    "female": "Урсула",
    "description": "Точность +5 п.п. A от успешной вылазки +10%, минимум +1 A.",
    "restriction": "Уклонение −7 п.п.",
    "startDescription": "30 A",
    "headwear": "flatcap",
    "bonuses": {
      "accuracy": 5,
      "questMoneyPercent": 10,
      "minimumExpeditionBonus": true,
      "evasion": -7,
      "startMoney": 300
    }
  },
  "estonia_delayed": {
    "id": "estonia_delayed",
    "nationality": "Эстония: невозмутимый",
    "male": "Март",
    "female": "Кадри",
    "description": "Первый полученный урон в каждом бою уменьшается на 25% и применяется после следующего собственного хода героя или при завершении боя.",
    "restriction": "Инициатива -10. Интеллект −1.",
    "startDescription": "Нет",
    "headwear": "beanie",
    "bonuses": {
      "delayFirstDamage": true,
      "initiative": -10,
      "attributes": {
        "intelligence": -1
      }
    }
  },
  "japan_scientist": {
    "id": "japan_scientist",
    "nationality": "Япония: учёный",
    "male": "Кэндзо",
    "female": "Юки",
    "description": "Шанс успеха Науки +5 п.п. Одно дополнительное очко перка при найме.",
    "restriction": "Сила −1.",
    "startDescription": "Дополнительное очко перка ×1",
    "headwear": "cap",
    "bonuses": {
      "success": {
        "science": 5
      },
      "extraPerks": 1,
      "attributes": {
        "strength": -1
      }
    }
  },
  "japan_samurai": {
    "id": "japan_samurai",
    "nationality": "Япония: самурай",
    "male": "Харуто",
    "female": "Акико",
    "description": "Уклонение +5 п.п. Ближнее оружие: +20 урона.",
    "restriction": "Огнестрельное оружие: −10 п.п. точности.",
    "startDescription": "Нет",
    "headwear": "headband",
    "bonuses": {
      "evasion": 5,
      "meleeDamage": 20,
      "firearmAccuracy": -10
    }
  },
  "japan_ninja": {
    "id": "japan_ninja",
    "nationality": "Япония: ниндзя",
    "male": "Рэн",
    "female": "Хана",
    "description": "Уклонение вплотную +10 п.п. Проверки скрытности +2. Первая атака вплотную в каждом бою: +10–40 урона.",
    "restriction": "Огнестрельное оружие: −10 п.п. точности. Получаемый опыт -10%",
    "startDescription": "Нет",
    "headwear": "hood",
    "bonuses": {
      "closeEvasion": 10,
      "stealthBonus": 2,
      "firstCloseDamage": true,
      "firearmAccuracy": -10,
      "xpPenalty": 10
    }
  },
  "armenia_connected": {
    "id": "armenia_connected",
    "nationality": "Армения: знакомый всем",
    "male": "Арам",
    "female": "Анаит",
    "description": "Отношение торговцев растёт в 2 раза быстрее, торговцы получают +20% опыта",
    "restriction": "Уклонение −5 п.п.",
    "startDescription": "нож ка-бар",
    "headwear": "flatcap",
    "bonuses": {
      "merchantRelationBonus": 100,
      "merchantXpBonus": 20,
      "evasion": -5,
      "startItems": [
        {
          "item": "kaBar",
          "qty": 1
        }
      ]
    }
  },
  "chechen_wrestler": {
    "id": "chechen_wrestler",
    "nationality": "Чечня: борец",
    "male": "Аслан",
    "female": "Мадина",
    "description": "Сила +1. Ловкость +1. Точность ближнего оружия +5 п.п. Первое попадание вплотную в каждом бою заменяется броском с прогиба: 20–60 + Сила × 10 урона. Цель пропускает следующий ход.",
    "restriction": "Интеллект −1. Восприятие −1. получаемый опыт -10%",
    "startDescription": "Нет",
    "headwear": "fur",
    "bonuses": {
      "attributes": {
        "strength": 1,
        "agility": 1,
        "intelligence": -1,
        "perception": -1
      },
      "meleeAccuracy": 5,
      "firstCloseThrow": true,
      "xpPenalty": 10
    }
  },
  "kabarda_negotiator": {
    "id": "kabarda_negotiator",
    "nationality": "Кабардин: переговорщик",
    "male": "Тимур",
    "female": "Зарина",
    "description": "Покупка у НПЦ −10%, продажа у НПЦ +10%",
    "restriction": "Проверки обнаружения ловушек −2.",
    "startDescription": "кожанка",
    "headwear": "fur",
    "bonuses": {
      "buyPercent": -10,
      "salePercent": 10,
      "trapBonus": -2,
      "startItems": [
        {
          "item": "qualityJacket",
          "qty": 1
        }
      ]
    }
  }
};
