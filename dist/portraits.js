// Схематичные портреты: один общий головной убор для двух полов национальности.
export const HEADWEAR={
 ushanka:{name:'Ушанка',shape:'<path d="M10 23V15Q10 5 32 5t22 10v8l-3 21-9-2V28H22v14l-9 2Z"/><path d="M16 14h32v14H16Z" fill="#a4a28b"/>'},
 feathers:{name:'Шапка с перьями',shape:'<path d="M27 22Q15 9 24 2q12 6 9 20M37 22Q34 6 45 1q8 12-2 24" fill="#ddd7b8"/><path d="m26 7 4 13m14-13-5 15" fill="none"/><path d="M15 23q17-11 34 0v8H15Z"/>'},
 cap:{name:'Кепка',shape:'<path d="M16 24v-8q16-17 32 0v8Z"/><path d="M14 24h39v5H14Z" fill="#8f997d"/>'},
 flatcap:{name:'Плоская кепка',shape:'<path d="M13 24q3-18 33-11l7 12-39 3Z"/><path d="m13 25 40 1-7 5H15Z" fill="#94907a"/>'},
 beret:{name:'Берет',shape:'<path d="M12 21q-2-13 22-14 23 0 20 14l-8 6H18Z"/><path d="M18 24h29v6H18Z" fill="#8c9a79"/><path d="M34 7V3" fill="none"/>'},
 beanie:{name:'Вязаная шапка',shape:'<path d="M15 24V19q0-17 17-17t17 17v5Z"/><path d="M14 22h36v9H14Z" fill="#8d967d"/>'},
 fur:{name:'Меховая шапка',shape:'<path d="M12 27V10l5-3 4 1 5-4 6 2 6-2 5 4 5-1 4 3v17Z" fill="#a09b84"/><path d="M12 25h40v6H12Z"/>'},
 cowboy:{name:'Ковбойская шляпа',shape:'<path d="m18 23 4-17 10 5 10-5 4 17Z" fill="#9b8259"/><path d="M4 21q28 13 56 0l-3 9H7Z" fill="#b39a6b"/>'},
 fedora:{name:'Шляпа',shape:'<path d="m17 25 5-18 11 4 10-4 4 18Z"/><path d="M7 25h50v6H7Z" fill="#aaa184"/><path d="M19 19h26v5H19Z" fill="#242f28"/>'},
 topHat:{name:'Высокая шляпа',shape:'<path d="M20 3h24l3 23H17Z"/><path d="M8 25h48v6H8Z" fill="#a29b80"/><path d="M19 18h26v7H19Z" fill="#8e9679"/>'},
 roundcap:{name:'Круглая шапочка',shape:'<path d="M16 24q0-18 16-18t16 18v4H16Z"/><path d="M17 22h30v6H17Z" fill="#b1a77d"/>'},
 straw:{name:'Соломенная шляпа',shape:'<path d="m17 24 8-17h14l8 17Z" fill="#c4ae72"/><path d="M4 24h56v7H4Z" fill="#d1bc87"/><path d="M20 19h24v5H20Z"/>'},
 headband:{name:'Повязка',shape:'<path d="M14 21h36v8H14Z" fill="#b9b29a"/><path d="m49 23 10 4-9 8M31 21v8" fill="none"/>'},
 bandana:{name:'Бандана',shape:'<path d="M14 24q0-17 18-17t18 17v5H14Z"/><path d="m49 23 12 6-10 4 5 10-10-12" fill="#8d9979"/>'},
 hood:{name:'Капюшон',shape:'<path d="M8 46V24Q8 0 32 0t24 24v22l-11-8V23q-13-15-26 0v15Z" fill="#77836d"/>'},
 wrap:{name:'Тканевый головной убор',shape:'<path d="M12 29V16Q12 2 32 2t20 14v13Z" fill="#b4ae94"/><path d="m13 14 38 9M16 8l34 10M13 24l34-17" fill="none"/>'},
 sailor:{name:'Морская фуражка',shape:'<path d="M14 10h36l-3 15H17Z" fill="#d3d2bc"/><path d="M15 23h34v7H15Z"/><path d="M23 29h30l-9 5H23Z"/>'},
 chef:{name:'Поварской колпак',shape:'<path d="M17 21Q5 6 20 5q8-11 16-2 19-3 16 11l-6 8v9H18Z" fill="#d8d6c0"/><path d="M18 24h28v7H18Z" fill="#a9b09b"/>'},
 kepi:{name:'Кепи',shape:'<path d="M16 7h32v18H16Z"/><path d="M13 25h39v5H13Z" fill="#a3a68e"/>'},
 fez:{name:'Феска',shape:'<path d="m19 26 4-23h18l4 23Z" fill="#966855"/><path d="M32 5h13v16" fill="none"/><path d="M42 20h6v8h-6Z"/>'}
};

export const NATIONALITY_HEADWEAR={
 nizhny_mechanic:'cap',neva_experimenter:'beret',petersburg_dreamer:'beret',butovo_trickster:'bandana',moscow_city_patron:'topHat',kazan_craftsman:'roundcap',murmansk_captain:'sailor',saratov_diplomat:'flatcap',volgograd_farmer:'straw',krasnodar_athlete:'headband',ufa_researcher:'beanie',ural_brawler:'ushanka',tula_gunsmith:'cap',novosibirsk_academic:'cap',tajik_builder:'roundcap',uzbek_assistant:'roundcap',baikal_firekeeper:'fur',azerbaijan_trader:'flatcap',siberian_tracker:'ushanka',kamchatka_survivor:'beanie',usa_survivor:'cap',usa_cowboy:'cowboy',english_detective:'flatcap',english_gentleman:'topHat',arab_skirmisher:'wrap',arab_demolitionist:'bandana',afroamerican_explorer:'cap',belarus_stalwart:'ushanka',brazil_footballer:'headband',greek_talent:'flatcap',jewish_family:'roundcap',jewish_merchant:'fedora',egypt_sunwalker:'wrap',india_yogi:'wrap',spain_dancer:'beret',spain_gambler:'fedora',italy_vendetta:'fedora',italy_quick:'cap',china_endurance:'straw',china_kungfu:'headband',korea_prepared:'cap',latin_adventurer:'bandana',mexico_musician:'cowboy',mongolia_destroyer:'fur',freed_prisoner:'beanie',germany_traditionalist:'cap',germany_engineer:'cap',nigeria_tracker:'wrap',norway_berserk:'beanie',poland_risk:'cap',portugal_sailor:'sailor',indigenous_scout:'feathers',soviet_veteran:'ushanka',russian_pilgrim:'beanie',yakut_hunter:'fur',france_charmer:'beret',france_marksman:'kepi',roma_trader:'fedora',roma_finder:'bandana',swiss_precise:'flatcap',estonia_delayed:'beanie',estonia_slow:'flatcap',japan_scientist:'cap',japan_samurai:'headband',japan_ninja:'hood',turkey_speaker:'fez',armenia_connected:'flatcap',georgia_cook:'chef',chechen_wrestler:'fur',kabarda_negotiator:'fur'
};
const legacy={ivan:'ushanka',hans:'cap',izya:'fedora',john:'cowboy'};
export function portraitGender(hero={}){return ['female','f','woman','женский','женщина'].includes(String(hero.gender??hero.sex??'').toLowerCase())?'female':'male';}
export function portraitHeadwear(hero={}){
 if(Object.hasOwn(HEADWEAR,hero.headwear))return hero.headwear;
 const nationality=hero.nationalityId??hero.originId??hero.identityId;
 if(Object.hasOwn(NATIONALITY_HEADWEAR,nationality))return NATIONALITY_HEADWEAR[nationality];
 if(Object.hasOwn(legacy,nationality))return legacy[nationality];
 const label=String(hero.nationality??'').toLowerCase();
 if(label.includes('русск'))return 'ushanka';if(label.includes('инде')||label.includes('коренных американ'))return 'feathers';
 if(label.includes('американ'))return 'cowboy';if(label.includes('немец'))return 'cap';if(label.includes('еврей'))return 'fedora';
 return 'beanie';
}
export function heroPortraitSvg(hero={}){
 const gender=portraitGender(hero),hat=portraitHeadwear(hero),female=gender==='female';
 const hair=female?'<path d="M15 28q-9 16-5 34l10-3 2-25M46 29q12 13 8 34l-12-4-3-26" fill="#443c31"/>':'<path d="M16 27h32v18H16Z" fill="#443c31"/>';
 const face=female?'<path d="M19 25h26v15q-1 14-13 17Q20 54 19 40Z"/>':'<path d="M17 25h30v16l-4 13-11 5-11-5-4-13Z"/>';
 return `<svg class="hero-portrait-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 76" role="img" aria-label="${female?'Женский':'Мужской'} портрет, ${HEADWEAR[hat].name}" data-gender="${gender}" data-headwear="${hat}"><rect width="64" height="76" rx="8" fill="#192b22"/>${hair}<path d="M6 76V67q2-12 19-13h14q17 1 19 13v9Z" fill="#60715c" stroke="#14251c" stroke-width="2"/><path d="M26 50h12v11H26Z" fill="#b5a184"/><g fill="#c8b59a" stroke="#4e4739" stroke-width="1.3">${face}</g><path d="M23 37h4m10 0h4M29 48h6" fill="none" stroke="#423b31" stroke-width="2" stroke-linecap="round"/>${female?'<path d="m22 35 3 2m17-2-3 2" stroke="#423b31" stroke-width="1.5"/>':''}<g fill="#67765a" stroke="#273729" stroke-width="1.7" stroke-linejoin="round">${HEADWEAR[hat].shape}</g><path d="m19 59 13 8 13-8M32 67v9" fill="none" stroke="#3d513f" stroke-width="2"/></svg>`;
}
