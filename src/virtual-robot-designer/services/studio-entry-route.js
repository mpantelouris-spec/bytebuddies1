const ROBOT_FAMILIES = {"rover":"kart","scout":"kart","crawler":"kart","tank":"kart","stealth":"kart","miningbot":"kart","securitybot":"kart","farmbot":"kart","spider":"adventure","droid":"adventure","mech":"adventure","drone":"flight","racedrone":"flight","rescuedrone":"flight","helicopter":"flight","hoverbot":"kart","hoverracer":"kart","submarine":"flight","deepseabot":"flight","robotarm":"adventure","factorybot":"adventure","spacerover":"kart","legobot":"adventure","battlebot":"adventure","striker":"football","footballbot":"football","blaster":"adventure","ninja":"adventure","berserker":"adventure","medbot":"adventure","firebot":"kart","jetplane":"flight","steathjet":"flight","aerobat":"flight","birdbot":"flight","custom":"adventure"};
const DEFAULT_ROBOTS={kart:'rover',flight:'jetplane',football:'footballbot',adventure:'droid'};
/** Resolve both new robot/track URLs and the site's existing course links. */
export function resolveStudioSelection(hash='') {
 const [,query='']=hash.replace(/^#/,'').split('?');
 const p=new URLSearchParams(query),course=p.get('course')||'';
 const explicitRobot=p.get('robot')||p.get('chassis');
 const legacyRobot=Object.keys(ROBOT_FAMILIES).find(id=>course.startsWith(id+'_'));
 const requestedGame=p.get('game');
 const robot=Object.hasOwn(ROBOT_FAMILIES,explicitRobot)?explicitRobot:legacyRobot||DEFAULT_ROBOTS[requestedGame]||'rover';
 const game=Object.hasOwn(DEFAULT_ROBOTS,requestedGame)&&!explicitRobot&&!legacyRobot?requestedGame:ROBOT_FAMILIES[robot];
 const track=Number(p.get('track')??(Number(p.get('mode')||1)-1));
 return {robot,game,track:Number.isInteger(track)&&track>=0&&track<10?track:0};
}
export function resolveStudioGame(hash){return resolveStudioSelection(hash).game}
