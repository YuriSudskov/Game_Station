import {PORTRAIT_ATLASES,COMIC_EQUIPMENT} from './portrait-art/index.js';

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
const PORTRAIT_EQUIPMENT={
 "duskScarf": [
  "neck",
  "<path fill=\"#d94c50\" d=\"m17 48 15 5 16-5 2 10-10 6 7 11-9 1-8-13-13-4z\"/><path fill=\"none\" stroke=\"#ff9b86\" d=\"m21 53 13 5 12-4\"/>"
 ],
 "greenStone": [
  "neck",
  "<path fill=\"none\" stroke=\"#9abc92\" d=\"m20 54 12 13 12-13\"/><path fill=\"#50f0a2\" d=\"m32 60 7 7-7 8-7-8z\"/><path fill=\"#d4ffbc\" stroke=\"none\" d=\"m32 62 4 5-4 4z\"/>"
 ],
 "ironJaw": [
  "face",
  "<path fill=\"#9db3bb\" d=\"m16 41 7 8h18l7-8-3 13-13 7-13-7z\"/><path stroke=\"#e3f2ee\" d=\"M23 51v4m6-4v6m6-6v6m6-6v4\"/>"
 ],
 "purpleTopHat": [
  "hat",
  "<path fill=\"#24162f\" d=\"m17 24 2-21h26l3 21z\"/><path fill=\"#ba59ec\" d=\"M18 17h29v7H18z\"/><path fill=\"#4a2c5f\" d=\"M7 23h50v7H7z\"/>"
 ],
 "goldCross": [
  "neck",
  "<path fill=\"none\" stroke=\"#ecbe50\" d=\"m18 55 14 12 14-12\"/><path fill=\"#ffd570\" d=\"M29 61h6v4h6v5h-6v6h-6v-6h-6v-5h6z\"/>"
 ],
 "expensiveGlasses": [
  "face",
  "<path fill=\"#161e26\" stroke=\"#e4be71\" d=\"M16 32h14l2 3 2-3h14v8l-4 4h-8l-4-5-4 5h-8l-4-4z\"/><path stroke=\"#8adbe9\" d=\"m20 36 6-2m12 2 6-2\"/>"
 ],
 "powerHelmet": [
  "hat",
  "<path fill=\"#506a76\" d=\"M12 19 20 6h24l8 13-2 26-8 11H22L14 45Z\"/><path fill=\"#79eeef\" d=\"M18 27h28l-3 7H21Z\"/><path stroke=\"#acc3c5\" d=\"m20 42 7 6m17-6-7 6\"/>"
 ],
 "spartaHelmet": [
  "hat",
  "<path fill=\"#191d21\" stroke=\"#111516\" d=\"M9 29v-8Q10 6 25 4h14q15 2 16 17v8l-5 9-6-10H20l-6 10Z\"/><path fill=\"#333a3d\" stroke=\"none\" d=\"M13 21Q15 7 32 7l8 1-13 2q-9 3-14 11Z\"/><path fill=\"none\" stroke=\"#565d60\" d=\"M12 26h40\"/><path fill=\"#ff4f50\" stroke=\"none\" d=\"m20 23 4-13 7 6 2-4 7-3 4 14-7-5-2 5-5-4-3-1Z\"/><path fill=\"none\" stroke=\"#55595a\" d=\"m15 33 6 17m28-17-6 17\"/>"
 ],
 "spartaGasHelmet": [
  "hat",
  "<path fill=\"#191d21\" stroke=\"#111516\" d=\"M9 29v-8Q10 6 25 4h14q15 2 16 17v8l-5 9-6-10H20l-6 10Z\"/><path fill=\"#333a3d\" stroke=\"none\" d=\"M13 21Q15 7 32 7l8 1-13 2q-9 3-14 11Z\"/><path fill=\"none\" stroke=\"#565d60\" d=\"M12 26h40\"/><path fill=\"#ff4f50\" stroke=\"none\" d=\"m20 23 4-13 7 6 2-4 7-3 4 14-7-5-2 5-5-4-3-1Z\"/><path fill=\"#23292a\" d=\"m15 29 8-3h18l8 3v15l-5 8-12 8-12-8-5-8Z\"/><path fill=\"#819da1\" stroke=\"#131c20\" d=\"M18 31q14-8 28 0v12l-4 7-10 6-10-6-4-7Z\"/><path fill=\"none\" stroke=\"#d2ecec\" d=\"m21 40 7-9m-6 14 10-13\"/><path fill=\"#47544f\" d=\"m43 44 10-5 7 4v11l-7 5-10-4Z\"/><ellipse cx=\"54\" cy=\"49\" rx=\"6\" ry=\"8\" fill=\"#65746a\"/><path fill=\"none\" stroke=\"#27332d\" d=\"M52 46h4m-4 3h4m-4 3h4\"/>"
 ],
 "hockeyMask": [
  "face",
  "<path fill=\"#eedfc1\" d=\"m16 31 8-5h16l8 5-3 19-13 11-13-11z\"/><path fill=\"#262223\" d=\"M20 34h10v6H20zm14 0h10v6H34z\"/><path stroke=\"#ca493e\" d=\"m28 29 4 4 4-4m-12 16 3 2m13-2-3 2\"/><path stroke=\"#2b2422\" d=\"M29 50h1m4 0h1m-4 4h2\"/>"
 ],
 "germanHelmet": [
  "hat",
  "<path fill=\"#717c67\" d=\"M9 28 13 14Q20 5 34 6t16 13l7 10-7 8-8-8H17l-4 6z\"/><path stroke=\"#b5baa0\" d=\"M13 26h35\"/>"
 ],
 "sovietArmyCap": [
  "hat",
  "<path fill=\"#98964d\" d=\"M13 27 19 9l14 6 14-6 5 18-19 5z\"/><path fill=\"#f06752\" stroke=\"none\" d=\"m32 16 1.5 4 4.5.3-3.5 2.7 1.1 4.3-3.6-2.6-3.6 2.6 1.1-4.3-3.5-2.7 4.5-.3z\"/>"
 ],
 "nkvdCap": [
  "hat",
  "<path fill=\"#344363\" d=\"M9 15 20 7h24l11 8-7 10H16z\"/><path fill=\"#ce5354\" d=\"M16 22h32v6H16z\"/><path fill=\"#20232e\" d=\"M15 27h34l-7 6H22z\"/><circle fill=\"#e5c05d\" cx=\"32\" cy=\"20\" r=\"3\"/>"
 ],
 "policeHelmet": [
  "hat",
  "<path fill=\"#344858\" stroke=\"#15212c\" d=\"M9 28V20Q10 7 23 5h18q13 2 14 15v8l-5 13-9-9H23l-9 9Z\"/><path fill=\"#607787\" stroke=\"none\" d=\"M13 21q2-12 14-13h12l-10 3q-9 1-16 10Z\"/><path fill=\"#7393a7\" fill-opacity=\".84\" stroke=\"#182633\" d=\"M14 26h36v16q0 8-8 13l-10 4-10-4q-8-5-8-13Z\"/><path fill=\"none\" stroke=\"#c1dfeb\" d=\"m19 43 10-13m-9 18 12-17\"/><path fill=\"none\" stroke=\"#253541\" stroke-width=\"3\" d=\"M12 27h40\"/><circle cx=\"14\" cy=\"30\" r=\"3\" fill=\"#607684\"/><circle cx=\"50\" cy=\"30\" r=\"3\" fill=\"#607684\"/>"
 ],
 "smokingCigarette": [
  "face",
  "<path stroke=\"#e4ddcb\" stroke-width=\"4\" d=\"m35 48 16 3\"/><path stroke=\"#ff6c4e\" stroke-width=\"3\" d=\"m49 50 4 1\"/><path fill=\"none\" stroke=\"#d3dae3\" d=\"M53 46q8-6 0-12t4-12\"/>"
 ],
 "captainTricorne": [
  "hat",
  "<path fill=\"#443130\" stroke=\"#e4ad57\" d=\"m4 13 15 4L32 4l13 13 15-4-7 16H11z\"/><path fill=\"#e5d3b1\" d=\"m27 17 5-4 5 4v5l-5 3-5-3z\"/>"
 ],
 "gangsterHat": [
  "hat",
  "<path fill=\"#4b5670\" d=\"m16 24 5-17 12 4 10-4 6 17z\"/><path fill=\"#c1cedf\" d=\"M18 19h29v6H18z\"/><path fill=\"#6e7d9b\" d=\"M3 24h58l-7 6H10z\"/>"
 ],
 "cowboyHat": [
  "hat",
  "<path fill=\"#b7773c\" d=\"m17 23 4-16 11 5 11-5 4 16z\"/><path fill=\"#55c7bf\" d=\"M18 19h28v5H18z\"/><path fill=\"#e3ad64\" d=\"M3 18q29 16 58 0l-5 13H8z\"/>"
 ],
 "shepherdPet": [
  "pet",
  "<path fill=\"#bb884e\" d=\"m40 57 2-15 7 7 8-2 5-6 2 17-3 12-10 4-10-8z\"/><path fill=\"#49382c\" d=\"m44 54 7 2 3 6 7-5-1 8-6 6-9-6z\"/><path stroke=\"#f9d39a\" d=\"M46 57h2m9 0h2\"/><path stroke=\"#e55352\" d=\"m43 70 11 4 8-5\"/>"
 ],
 "mouseVasya": [
  "pet",
  "<path fill=\"none\" stroke=\"#e2a3aa\" d=\"M52 71q12 6 11-5\"/><ellipse fill=\"#a8a5b8\" cx=\"51\" cy=\"66\" rx=\"10\" ry=\"7\"/><circle fill=\"#dea3b2\" cx=\"47\" cy=\"57\" r=\"5\"/><circle fill=\"#dea3b2\" cx=\"55\" cy=\"58\" r=\"4\"/><path fill=\"#c7bfcc\" d=\"m47 61 9 1-5 8-9-4z\"/><circle fill=\"#232332\" cx=\"48\" cy=\"63\" r=\"1.5\"/>"
 ]
};
const portraitOverlay=entry=>entry?`<g stroke="#241b1f" stroke-width="1.35" stroke-linejoin="round" stroke-linecap="round">${entry[1]}</g>`:"";
const comicPortraits=new Map(PORTRAIT_ATLASES.flatMap(([file,ids])=>ids.map((id,index)=>[id,{file,index}])));
const portraitAsset=file=>new URL('./portrait-art/'+file,import.meta.url).href;
function comicPortrait(hero,female){
 const portrait=comicPortraits.get(hero.nationalityId??hero.originId??hero.identityId);
 if(!portrait)return '';
 const cell=portrait.index*2+Number(female);
 const col=cell%4,row=Math.floor(cell/4);
 return '<svg width="64" height="76" viewBox="'+col+' '+row+' 1 1" preserveAspectRatio="xMidYMid slice" overflow="hidden"><image href="'+portraitAsset(portrait.file)+'" width="4" height="4" preserveAspectRatio="none"/></svg>';
}
export function comicEquipmentUrl(id){
 return Object.hasOwn(COMIC_EQUIPMENT,id)?portraitAsset(id+'.png'):'';
}
function comicEquipment(id){
 const bounds=COMIC_EQUIPMENT[id];
 if(!bounds)return '';
 const [x,y,width,height]=bounds;
 return '<image href="'+portraitAsset(id+'.png')+'" x="'+x+'" y="'+y+'" width="'+width+'" height="'+height+'" preserveAspectRatio="xMidYMid meet"/>';
}
const PORTRAIT_MARK_GLOWS={
 regeneration:{name:'\u0420\u0435\u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u044f',color:'#66f6ad'},
 darkGrasp:{name:'\u0422\u0451\u043c\u043d\u0430\u044f \u0445\u0432\u0430\u0442\u043a\u0430',color:'#c18aff'}
};
function portraitMarkGlow(color){
 if(!color)return '';
 return `<g aria-hidden="true" pointer-events="none"><rect width="64" height="76" rx="7" fill="${color}" opacity=".12"/><rect x=".5" y=".5" width="63" height="75" rx="7" fill="none" stroke="${color}" stroke-width="12" opacity=".08"/><rect x=".5" y=".5" width="63" height="75" rx="7" fill="none" stroke="${color}" stroke-width="6" opacity=".13"/><rect x="1" y="1" width="62" height="74" rx="7" fill="none" stroke="${color}" stroke-width="1.5" opacity=".85"/></g>`;
}
function portraitResuscitationScar(comic){
 const color=comic?'#623c32':'#885b4b';
 return `<g data-scar="resuscitation" aria-hidden="true" pointer-events="none">
  <path d="M43.8 36.5Q41.4 39.1 40.6 41.7L38.8 44.2Q37.3 46.9 35.2 47.9Q37.3 45.6 38.1 43.7L39.9 41Q41.2 38.1 43.8 36.5Z" fill="${color}"/>
  <path d="M42.9 37.7Q41.4 39.7 40.9 41.5L39.2 44.1Q38.3 46 36.2 47.3" fill="none" stroke="#d1a085" stroke-width=".55" opacity=".9" stroke-linecap="round"/>
  <path d="m41.3 38.9 1.2.9m-2.8 1.5 1.45 1m-3.1 1.8 1.3.9" fill="none" stroke="${color}" stroke-width=".5" opacity=".67" stroke-linecap="round"/>
 </g>`;
}
export function heroPortraitSvg(hero={}){
 const gender=portraitGender(hero),hat=portraitHeadwear(hero),female=gender==='female';
 const special=PORTRAIT_EQUIPMENT[hero.special],pet=PORTRAIT_EQUIPMENT[hero.pet];
 const hair=female?'<path d="M15 28q-9 16-5 34l10-3 2-25M46 29q12 13 8 34l-12-4-3-26" fill="#443c31"/>':'<path d="M16 27h32v18H16Z" fill="#443c31"/>';
 const mark=Object.hasOwn(PORTRAIT_MARK_GLOWS,hero.mark)?PORTRAIT_MARK_GLOWS[hero.mark]:null;
 const artwork=comicPortrait(hero,female);
 const scar=hero.resuscitated?portraitResuscitationScar(Boolean(artwork)):'';
 const face=female?'<path d="M19 25h26v15q-1 14-13 17Q20 54 19 40Z"/>':'<path d="M17 25h30v16l-4 13-11 5-11-5-4-13Z"/>';
 return `<svg class="hero-portrait-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 76" role="img" aria-label="${female?'Женский':'Мужской'} портрет, ${HEADWEAR[hat].name}${mark?`, Метка ${mark.name}`:''}" data-gender="${gender}" data-headwear="${hat}"${mark?` data-mark="${hero.mark}"`:''}>${artwork||`<rect width="64" height="76" rx="8" fill="#192b22"/>${ruinsSvg()}${hair}<path d="M6 76V67q2-12 19-13h14q17 1 19 13v9Z" fill="#60715c" stroke="#14251c" stroke-width="2"/><path d="M26 50h12v11H26Z" fill="#b5a184"/><g fill="#c8b59a" stroke="#4e4739" stroke-width="1.3">${face}</g><path d="M23 37h4m10 0h4M29 48h6" fill="none" stroke="#423b31" stroke-width="2" stroke-linecap="round"/>`}${scar}${hero.isTea?'<path d="m43 55 9 3-5 14-4-5-5 1Z" fill="#b83f43"/>':''}${!artwork&&female?'<path d="m22 35 3 2m17-2-3 2" stroke="#423b31" stroke-width="1.5"/>':''}${artwork?'':`<g fill="#67765a" stroke="#273729" stroke-width="1.7" stroke-linejoin="round">${special?.[0]==='hat'?'':HEADWEAR[hat].shape}</g><path d="m19 59 13 8 13-8M32 67v9" fill="none" stroke="#3d513f" stroke-width="2"/>`}${(artwork&&comicEquipment(hero.special))||portraitOverlay(special)}${(artwork&&comicEquipment(hero.pet))||portraitOverlay(pet)}${portraitMarkGlow(mark?.color)}</svg>`;
}

export function ruinsSvg(){return '<g fill="#39433e"><path d="M0 57V19l8-4 4 8 7-3v37ZM43 57V10l7 4 4-7 5 8 5-3v45Z"/><path d="M0 61V38l8-5 10 5 6-5v28ZM40 61V33l12-5 12 7v26Z" fill="#283630"/><path d="M4 25h4v6H4Zm8 3h3v5h-3Zm36-8h4v6h-4Zm10 1h4v6h-4ZM4 43h4v6H4Zm10-1h4v7h-4Zm33-4h4v6h-4Zm10 1h4v6h-4Z" fill="#14251f"/><path d="m0 67 10-8 8 5 9-5 11 5 10-7 16 9v10H0Z" fill="#4c5042"/></g>';}
export function npcPortraitSvg(id='yuras'){
 if(id==='pikiSix')return '<svg class="hero-portrait-svg npc-portrait-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 76" role="img" aria-label="Шестёрка пик"><rect width="64" height="76" rx="8" fill="#3f343c"/><path d="M4 76V64q3-15 22-15h12q19 0 22 15v12" fill="#514a43" stroke="#302b2a" stroke-width="2"/><path d="M16 30q0-19 16-19t16 19v10l-6 13-10 5-10-5-6-13Z" fill="#c3a88d" stroke="#514236" stroke-width="2"/><path d="m22 33 6 2m8 0 6-2m-14 13h8" fill="none" stroke="#46362e" stroke-width="2" stroke-linecap="round"/><path d="M40 38c-2 3-5 4-5 6a3 3 0 0 0 5 1 3 3 0 0 0 5-1c0-2-3-3-5-6Zm-1 7-1 3h4l-1-3Z" fill="#261f26"/><path d="m19 57 13 9 13-9M32 66v10" fill="none" stroke="#302b2a" stroke-width="2"/></svg>';
 if(id==='alexey')return '<svg class="hero-portrait-svg npc-portrait-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 76" role="img" aria-label="Алексей Иваныч"><rect width="64" height="76" rx="8" fill="#31543b"/><path d="M5 76V64q3-13 20-14h14q17 1 20 14v12" fill="#697858" stroke="#26372b" stroke-width="2"/><path d="M17 30q0-19 15-19t15 19l-2 14-6 10-7 4-7-4-6-10Z" fill="#c8b194" stroke="#514735" stroke-width="2"/><path d="M23 34h4m10 0h4" stroke="#463b2f" stroke-width="2" stroke-linecap="round"/><path d="M32 42q-4-2-11 5 6 4 11-1 5 5 11 1-7-7-11-5Z" fill="#4e4336"/><path d="m19 57 13 9 13-9M32 66v10" fill="none" stroke="#334730" stroke-width="2"/><text x="42" y="69" font-family="sans-serif" font-weight="bold" font-size="9" fill="#7add7b">М</text></svg>';
 const keeper=id==='keeper',red=id==='bobrov',veteran=id==='duren',vasek=id==='vasek';
 const allied=keeper||id==='yuras'||vasek;
 const label=keeper?'Смотритель станции':red?'Товарищ Бобров':veteran?'Дурень':vasek?'Васёк':'Юрась';
 const hat=vasek?'<path d="M13 28v-7q0-16 19-16t19 16v7Z" fill="#3f4e66"/><path d="M12 23h40v7H12Z" fill="#253349"/><path d="M27 12v8m0-8 5 5 5-5v8" fill="none" stroke="#8ddd98" stroke-width="2"/>':red?'<path d="M12 27V18L24 9l8-8 8 8 12 9v9l-8 8v-9H20v9Z" fill="#7d7755" stroke="#393d2e"/><path d="m32 10 2 5 6 0-5 4 2 6-5-4-5 4 2-6-5-4h6Z" fill="#dc5048"/>':(id==='yuras'?'<path d="M10 24q1-13 19-15 17-2 25 13l-7 5H14Z" fill="#8c8770"/><path d="M14 23h34v6H14Z" fill="#585e49"/><path d="m18 28 34-2q1 7-25 8Z" fill="#414936"/><path d="M31 10v12M14 22h35" fill="none" stroke="#676c54"/>':HEADWEAR[keeper?'cap':'ushanka'].shape);
 return '<svg class="hero-portrait-svg npc-portrait-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 76" role="img" aria-label="'+label+'"><rect width="64" height="76" rx="8" fill="'+(red?'#61332e':allied?'#31543b':'#263b34')+'"/>'+(keeper?'<path d="M0 52V23a32 32 0 0 1 64 0v29M6 52V25a26 26 0 0 1 52 0v27" fill="none" stroke="#426c49" stroke-width="3"/>':red?'<path d="M0 58 64 5M0 33 50 0M20 76 64 32" stroke="#753c35" stroke-width="7"/>':ruinsSvg())+'<path d="M4 76V64q2-13 22-14h12q20 1 22 14v12" fill="'+(red?'#727354':'#64705a')+'" stroke="#26372b" stroke-width="2"/><path d="M14 60v16m8-18v18m10-17v17m10-18v18m8-16v16M7 67h50" stroke="#43523e" stroke-width="1.5"/><path d="M26 48h12v12H26Z" fill="#ae9678"/><path d="M17 24h30v16l-5 12-10 5-10-5-5-12Z" fill="'+(veteran?'#b6a080':'#c8b194')+'" stroke="#514735"/><path d="M23 35h4m10 0h4M29 46h7" stroke="#463b2f" stroke-width="2" stroke-linecap="round"/>'+(veteran?'<path d="m19 41 7 9 6 4 9-7 4-7-3 13-10 8-10-8Z" fill="#777568"/><path d="m38 31 6 10" stroke="#785b47"/>':'<path d="M24 44q8-5 16 0" stroke="#534536" stroke-width="2" fill="none"/>')+(vasek?'<g fill="#263a43" stroke="#8b9f99" stroke-width="1.5"><rect x="19" y="32" width="11" height="8" rx="3"/><rect x="34" y="32" width="11" height="8" rx="3"/><path d="M30 35h4m-19 0h4m26 0h4"/></g>':'')+'<g fill="#71795b" stroke="#34412e" stroke-width="1.5">'+hat+'</g><path d="m19 57 13 9 13-9M32 66v10" fill="none" stroke="#334730" stroke-width="2"/>'+(allied?'<text x="39" y="69" font-family="sans-serif" font-weight="bold" font-size="8" fill="#7add7b">М</text>':'<g transform="rotate(19 52 54)"><path d="M49 26h5v28h-5Z" fill="#202b29"/><path d="M48 27h7v15h-7Z" fill="#45534b"/><path d="M47 53h9v19h-9Z" fill="#333d35"/><path d="M48 57h7v14h-7Z" fill="#6c5940"/><path d="M47 49h10v5H47Zm-4 0v-7h5" fill="none" stroke="#24322a" stroke-width="3"/></g>')+'</svg>';
}

const portraitLoads=new Map();
function preloadPortrait(file){
 const url=portraitAsset(file);
 if(!portraitLoads.has(url))portraitLoads.set(url,new Promise(resolve=>{
  const image=new Image();
  image.onload=()=>resolve();
  image.onerror=()=>{portraitLoads.delete(url);resolve();};
  image.src=url;
 }));
 return portraitLoads.get(url);
}
export function preloadHeroPortraits(heroes=[]){
 if(typeof Image==='undefined')return;
 const selected=new Set(heroes.map(hero=>comicPortraits.get(hero.nationalityId??hero.originId??hero.identityId)?.file).filter(Boolean));
 const equipment=new Set(heroes.flatMap(hero=>[hero.special,hero.pet]).filter(id=>Object.hasOwn(COMIC_EQUIPMENT,id)).map(id=>id+'.png'));
 const first=Promise.all([...selected,...equipment].map(preloadPortrait));
 first.then(async()=>{
  const remaining=PORTRAIT_ATLASES.map(([file])=>file).filter(file=>!selected.has(file));
  for(const file of remaining)await preloadPortrait(file);
 }).catch(()=>{});
 return first;
}
