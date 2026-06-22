// src/App.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { CheckoutModal } from './TicketCheckout';
import Navbar from './components/Navbar';
import './App.css';

const ISO = {
  'Mexico':'mx','South Africa':'za','South Korea':'kr','Czechia':'cz',
  'Canada':'ca','Bosnia and Herzegovina':'ba','USA':'us','Paraguay':'py',
  'Qatar':'qa','Switzerland':'ch','Brazil':'br','Morocco':'ma','Haiti':'ht',
  'Scotland':'gb-sct','Australia':'au','Türkiye':'tr','Germany':'de',
  'Curaçao':'cw','Netherlands':'nl','Japan':'jp','Ivory Coast':'ci',
  'Ecuador':'ec','Sweden':'se','Tunisia':'tn','Spain':'es','Cape Verde':'cv',
  'Belgium':'be','Egypt':'eg','Saudi Arabia':'sa','Iran':'ir','New Zealand':'nz',
  'France':'fr','Senegal':'sn','Iraq':'iq','Norway':'no','Argentina':'ar',
  'Algeria':'dz','Austria':'at','Jordan':'jo','Portugal':'pt','DR Congo':'cd',
  'England':'gb-eng','Croatia':'hr','Ghana':'gh','Panama':'pa',
  'Uzbekistan':'uz','Colombia':'co','Uruguay':'uy','Bosnia & Herzegovina':'ba',
};

// Map friendly names to API-Football's strict official names
const getApiTeamName = (name) => {
  const aliases = {
    'South Korea': 'Korea Republic',
    'USA': 'United States',
    'Türkiye': 'Turkey',
    'Ivory Coast': "Cote D'Ivoire",
    'Bosnia & Herzegovina': 'Bosnia',
    'Bosnia and Herzegovina': 'Bosnia'
  };
  return aliases[name] || name;
};

const flagUrl = code =>
  `https://img.vggcdn.net/broadway-icons/v2.21.0/flags/small/${code}.svg`;

const ALL_MATCHES = [
  // ── Jun 11 ──────────────────────────────────────────────────────────────
  { date:'Jun 11', day:'Thu', num:'11', grp:'A', t1:'Mexico', t2:'South Africa', result:'2–0', venue:'Estadio Azteca', city:'Mexico City', tags:[{l:'Opening match',c:'tag-hot'},{l:'Group A',c:'tag-group'}], played:true },
  { date:'Jun 11', day:'Thu', num:'11', grp:'A', t1:'South Korea', t2:'Czechia', result:'2–1', venue:'Estadio Akron', city:'Zapopan', tags:[{l:'Group A',c:'tag-group'}], played:true },
  { date:'Jun 12', day:'Fri', num:'12', grp:'B', t1:'Canada', t2:'Bosnia and Herzegovina', result:'1–1', venue:'Toronto Stadium', city:'Toronto', tags:[{l:'Canada debut',c:'tag-debut'},{l:'Group B',c:'tag-group'}], played:true },
  { date:'Jun 12', day:'Fri', num:'12', grp:'D', t1:'USA', t2:'Paraguay', result:'4–1', venue:'SoFi Stadium', city:'Los Angeles', tags:[{l:'USA debut',c:'tag-debut'},{l:'Group D',c:'tag-group'}], played:true },
  { date:'Jun 13', day:'Sat', num:'13', grp:'B', t1:'Qatar', t2:'Switzerland', result:'1–1', venue:"Levi's Stadium", city:'Santa Clara', tags:[{l:'Group B',c:'tag-group'}], played:true },
  { date:'Jun 13', day:'Sat', num:'13', grp:'C', t1:'Brazil', t2:'Morocco', result:'1–1', venue:'MetLife Stadium', city:'East Rutherford', tags:[{l:'Group C',c:'tag-group'}], played:true },
  { date:'Jun 13', day:'Sat', num:'13', grp:'C', t1:'Haiti', t2:'Scotland', result:'0–1', venue:'Gillette Stadium', city:'Foxborough', tags:[{l:'Group C',c:'tag-group'}], played:true },
  { date:'Jun 14', day:'Sun', num:'14', grp:'D', t1:'Australia', t2:'Türkiye', result:'2–0', venue:'BC Place', city:'Vancouver', tags:[{l:'Group D',c:'tag-group'}], played:true },
  { date:'Jun 14', day:'Sun', num:'14', grp:'E', t1:'Germany', t2:'Curaçao', result:'7–1', venue:'Houston Stadium', city:'Houston', tags:[{l:'Group E',c:'tag-group'}], played:true },
  { date:'Jun 14', day:'Sun', num:'14', grp:'F', t1:'Netherlands', t2:'Japan', result:'2–2', venue:'Dallas Stadium', city:'Arlington', tags:[{l:'Group F',c:'tag-group'}], played:true },
  { date:'Jun 14', day:'Sun', num:'14', grp:'E', t1:'Ivory Coast', t2:'Ecuador', result:'1–0', venue:'Philadelphia Stadium', city:'Philadelphia', tags:[{l:'Group E',c:'tag-group'}], played:true },
  { date:'Jun 14', day:'Sun', num:'14', grp:'F', t1:'Sweden', t2:'Tunisia', result:'5–1', venue:'Monterrey Stadium', city:'Monterrey', tags:[{l:'Group F',c:'tag-group'}], played:true },
  { date:'Jun 15', day:'Mon', num:'15', grp:'H', t1:'Spain', t2:'Cape Verde', result:'0–0', venue:'Mercedes-Benz Stadium', city:'Atlanta', tags:[{l:'Group H',c:'tag-group'}], played:true },
  { date:'Jun 15', day:'Mon', num:'15', grp:'G', t1:'Belgium', t2:'Egypt', result:'1–1', venue:'Lumen Field', city:'Seattle', tags:[{l:'Group G',c:'tag-group'}], played:true },
  { date:'Jun 15', day:'Mon', num:'15', grp:'H', t1:'Saudi Arabia', t2:'Uruguay', result:'1–1', venue:'Hard Rock Stadium', city:'Miami Gardens', tags:[{l:'Group H',c:'tag-group'}], played:true },
  { date:'Jun 15', day:'Mon', num:'15', grp:'G', t1:'Iran', t2:'New Zealand', result:'2–2', venue:'SoFi Stadium', city:'Los Angeles', tags:[{l:'Group G',c:'tag-group'}], played:true },
  { date:'Jun 16', day:'Tue', num:'16', grp:'I', t1:'France', t2:'Senegal', result:'3–1', venue:'MetLife Stadium', city:'East Rutherford', tags:[{l:'Group I',c:'tag-group'}], played:true },
  { date:'Jun 16', day:'Tue', num:'16', grp:'I', t1:'Iraq', t2:'Norway', result:'1–4', venue:'Gillette Stadium', city:'Foxborough', tags:[{l:'Group I',c:'tag-group'}], played:true },
  { date:'Jun 16', day:'Tue', num:'16', grp:'J', t1:'Argentina', t2:'Algeria', result:'3–0', venue:'Arrowhead Stadium', city:'Kansas City', tags:[{l:'Group J',c:'tag-group'}], played:true },
  { date:'Jun 17', day:'Wed', num:'17', grp:'J', t1:'Austria', t2:'Jordan', result:'3–1', venue:"Levi's Stadium", city:'Santa Clara', tags:[{l:'Group J',c:'tag-group'}], played:true },
  { date:'Jun 17', day:'Wed', num:'17', grp:'K', t1:'Portugal', t2:'DR Congo', result:'1–1', venue:'NRG Stadium', city:'Houston', tags:[{l:'Group K',c:'tag-group'}], played:true },
  { date:'Jun 17', day:'Wed', num:'17', grp:'L', t1:'England', t2:'Croatia', result:'4–2', venue:'AT&T Stadium', city:'Arlington', tags:[{l:'Group L',c:'tag-group'}], played:true },
  { date:'Jun 17', day:'Wed', num:'17', grp:'L', t1:'Ghana', t2:'Panama', result:'1–0', venue:'BMO Field', city:'Toronto', tags:[{l:'Group L',c:'tag-group'}], played:true },
  { date:'Jun 17', day:'Wed', num:'17', grp:'K', t1:'Uzbekistan', t2:'Colombia', result:'1–3', venue:'Estadio Azteca', city:'Mexico City', tags:[{l:'Group K',c:'tag-group'}], played:true },
  { date:'Jun 18', day:'Thu', num:'18', grp:'A', t1:'Czechia', t2:'South Africa', result:'1–1', venue:'Mercedes-Benz Stadium', city:'Atlanta', tags:[{l:'Group A',c:'tag-group'}], played:true },
  { date:'Jun 18', day:'Thu', num:'18', grp:'B', t1:'Switzerland', t2:'Bosnia & Herzegovina', result:'4–1', venue:'SoFi Stadium', city:'Los Angeles', tags:[{l:'Group B',c:'tag-group'}], played:true },
  { date:'Jun 18', day:'Thu', num:'18', grp:'B', t1:'Canada', t2:'Qatar', time:'6:00 PM ET', venue:'BC Place', city:'Vancouver', tags:[{l:'Canada',c:'tag-debut'},{l:'Group B',c:'tag-group'}], played:false },
  { date:'Jun 18', day:'Thu', num:'18', grp:'A', t1:'Mexico', t2:'South Korea', time:'9:00 PM ET', venue:'Estadio Akron', city:'Zapopan', tags:[{l:'Group A',c:'tag-group'}], played:false },
  { date:'Jun 19', day:'Fri', num:'19', grp:'D', t1:'USA', t2:'Australia', time:'3:00 PM ET', venue:'Lumen Field', city:'Seattle', tags:[{l:'USA',c:'tag-debut'},{l:'Group D',c:'tag-group'}], played:false },
  { date:'Jun 19', day:'Fri', num:'19', grp:'C', t1:'Scotland', t2:'Morocco', time:'6:00 PM ET', venue:'Gillette Stadium', city:'Foxborough', tags:[{l:'Group C',c:'tag-group'}], played:false },
  { date:'Jun 19', day:'Fri', num:'19', grp:'C', t1:'Brazil', t2:'Haiti', time:'8:30 PM ET', venue:'Lincoln Financial Field', city:'Philadelphia', tags:[{l:'Group C',c:'tag-group'}], played:false },
  { date:'Jun 19', day:'Fri', num:'19', grp:'D', t1:'Türkiye', t2:'Paraguay', time:'11:00 PM ET', venue:"Levi's Stadium", city:'Santa Clara', tags:[{l:'Group D',c:'tag-group'}], played:false },
  { date:'Jun 20', day:'Sat', num:'20', grp:'F', t1:'Netherlands', t2:'Sweden', time:'1:00 PM ET', venue:'NRG Stadium', city:'Houston', tags:[{l:'Group F',c:'tag-group'}], played:false },
  { date:'Jun 20', day:'Sat', num:'20', grp:'E', t1:'Germany', t2:'Ivory Coast', time:'4:00 PM ET', venue:'BMO Field', city:'Toronto', tags:[{l:'Group E',c:'tag-group'}], played:false },
  { date:'Jun 20', day:'Sat', num:'20', grp:'E', t1:'Ecuador', t2:'Curaçao', time:'8:00 PM ET', venue:'Arrowhead Stadium', city:'Kansas City', tags:[{l:'Group E',c:'tag-group'}], played:false },
  { date:'Jun 21', day:'Sun', num:'21', grp:'F', t1:'Tunisia', t2:'Japan', time:'12:00 AM ET', venue:'Estadio BBVA', city:'Monterrey', tags:[{l:'Group F',c:'tag-group'}], played:false },
  { date:'Jun 21', day:'Sun', num:'21', grp:'H', t1:'Spain', t2:'Saudi Arabia', time:'12:00 PM ET', venue:'Mercedes-Benz Stadium', city:'Atlanta', tags:[{l:'Group H',c:'tag-group'}], played:false },
  { date:'Jun 21', day:'Sun', num:'21', grp:'G', t1:'Belgium', t2:'Iran', time:'3:00 PM ET', venue:'SoFi Stadium', city:'Los Angeles', tags:[{l:'Group G',c:'tag-group'}], played:false },
  { date:'Jun 21', day:'Sun', num:'21', grp:'H', t1:'Uruguay', t2:'Cape Verde', time:'6:00 PM ET', venue:'Hard Rock Stadium', city:'Miami Gardens', tags:[{l:'Group H',c:'tag-group'}], played:false },
  { date:'Jun 21', day:'Sun', num:'21', grp:'G', t1:'New Zealand', t2:'Egypt', time:'9:00 PM ET', venue:'BC Place', city:'Vancouver', tags:[{l:'Group G',c:'tag-group'}], played:false },
  { date:'Jun 22', day:'Mon', num:'22', grp:'J', t1:'Argentina', t2:'Austria', time:'1:00 PM ET', venue:'AT&T Stadium', city:'Arlington', tags:[{l:'Group J',c:'tag-group'}], played:false },
  { date:'Jun 22', day:'Mon', num:'22', grp:'I', t1:'France', t2:'Iraq', time:'5:00 PM ET', venue:'Lincoln Financial Field', city:'Philadelphia', tags:[{l:'Group I',c:'tag-group'}], played:false },
  { date:'Jun 22', day:'Mon', num:'22', grp:'I', t1:'Norway', t2:'Senegal', time:'8:00 PM ET', venue:'MetLife Stadium', city:'East Rutherford', tags:[{l:'Group I',c:'tag-group'}], played:false },
  { date:'Jun 22', day:'Mon', num:'22', grp:'J', t1:'Jordan', t2:'Algeria', time:'11:00 PM ET', venue:"Levi's Stadium", city:'Santa Clara', tags:[{l:'Group J',c:'tag-group'}], played:false },
  { date:'Jun 23', day:'Tue', num:'23', grp:'K', t1:'Portugal', t2:'Uzbekistan', time:'1:00 PM ET', venue:'NRG Stadium', city:'Houston', tags:[{l:'Group K',c:'tag-group'}], played:false },
  { date:'Jun 23', day:'Tue', num:'23', grp:'L', t1:'England', t2:'Ghana', time:'4:00 PM ET', venue:'Gillette Stadium', city:'Foxborough', tags:[{l:'Group L',c:'tag-group'}], played:false },
  { date:'Jun 23', day:'Tue', num:'23', grp:'L', t1:'Panama', t2:'Croatia', time:'7:00 PM ET', venue:'BMO Field', city:'Toronto', tags:[{l:'Group L',c:'tag-group'}], played:false },
  { date:'Jun 23', day:'Tue', num:'23', grp:'K', t1:'Colombia', t2:'DR Congo', time:'10:00 PM ET', venue:'Estadio Akron', city:'Zapopan', tags:[{l:'Group K',c:'tag-group'}], played:false },
  { date:'Jun 24', day:'Wed', num:'24', grp:'B', t1:'Switzerland', t2:'Canada', time:'3:00 PM ET', venue:'BC Place', city:'Vancouver', tags:[{l:'Group B',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 24', day:'Wed', num:'24', grp:'B', t1:'Bosnia & Herzegovina', t2:'Qatar', time:'3:00 PM ET', venue:'Lumen Field', city:'Seattle', tags:[{l:'Group B',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 24', day:'Wed', num:'24', grp:'C', t1:'Scotland', t2:'Brazil', time:'6:00 PM ET', venue:'Hard Rock Stadium', city:'Miami Gardens', tags:[{l:'Group C',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 24', day:'Wed', num:'24', grp:'C', t1:'Morocco', t2:'Haiti', time:'6:00 PM ET', venue:'Mercedes-Benz Stadium', city:'Atlanta', tags:[{l:'Group C',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 24', day:'Wed', num:'24', grp:'A', t1:'Czechia', t2:'Mexico', time:'9:00 PM ET', venue:'Estadio Azteca', city:'Mexico City', tags:[{l:'Group A',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 24', day:'Wed', num:'24', grp:'A', t1:'South Africa', t2:'South Korea', time:'9:00 PM ET', venue:'Estadio BBVA', city:'Monterrey', tags:[{l:'Group A',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 25', day:'Thu', num:'25', grp:'E', t1:'Curaçao', t2:'Ivory Coast', time:'4:00 PM ET', venue:'Lincoln Financial Field', city:'Philadelphia', tags:[{l:'Group E',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 25', day:'Thu', num:'25', grp:'E', t1:'Ecuador', t2:'Germany', time:'4:00 PM ET', venue:'MetLife Stadium', city:'East Rutherford', tags:[{l:'Group E',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 25', day:'Thu', num:'25', grp:'F', t1:'Japan', t2:'Sweden', time:'7:00 PM ET', venue:'AT&T Stadium', city:'Arlington', tags:[{l:'Group F',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 25', day:'Thu', num:'25', grp:'F', t1:'Tunisia', t2:'Netherlands', time:'7:00 PM ET', venue:'Arrowhead Stadium', city:'Kansas City', tags:[{l:'Group F',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 25', day:'Thu', num:'25', grp:'D', t1:'Türkiye', t2:'USA', time:'10:00 PM ET', venue:'SoFi Stadium', city:'Los Angeles', tags:[{l:'USA',c:'tag-debut'},{l:'Group D',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 25', day:'Thu', num:'25', grp:'D', t1:'Paraguay', t2:'Australia', time:'10:00 PM ET', venue:"Levi's Stadium", city:'Santa Clara', tags:[{l:'Group D',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 26', day:'Fri', num:'26', grp:'I', t1:'Norway', t2:'France', time:'3:00 PM ET', venue:'Gillette Stadium', city:'Foxborough', tags:[{l:'Group I',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 26', day:'Fri', num:'26', grp:'I', t1:'Senegal', t2:'Iraq', time:'3:00 PM ET', venue:'BMO Field', city:'Toronto', tags:[{l:'Group I',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 26', day:'Fri', num:'26', grp:'H', t1:'Cape Verde', t2:'Saudi Arabia', time:'8:00 PM ET', venue:'NRG Stadium', city:'Houston', tags:[{l:'Group H',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 26', day:'Fri', num:'26', grp:'H', t1:'Uruguay', t2:'Spain', time:'8:00 PM ET', venue:'Estadio Akron', city:'Zapopan', tags:[{l:'Group H',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 26', day:'Fri', num:'26', grp:'G', t1:'Egypt', t2:'Iran', time:'11:00 PM ET', venue:'Lumen Field', city:'Seattle', tags:[{l:'Group G',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 26', day:'Fri', num:'26', grp:'G', t1:'New Zealand', t2:'Belgium', time:'11:00 PM ET', venue:'BC Place', city:'Vancouver', tags:[{l:'Group G',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 27', day:'Sat', num:'27', grp:'L', t1:'Panama', t2:'England', time:'5:00 PM ET', venue:'MetLife Stadium', city:'East Rutherford', tags:[{l:'Group L',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 27', day:'Sat', num:'27', grp:'L', t1:'Croatia', t2:'Ghana', time:'5:00 PM ET', venue:'Lincoln Financial Field', city:'Philadelphia', tags:[{l:'Group L',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 27', day:'Sat', num:'27', grp:'K', t1:'Colombia', t2:'Portugal', time:'7:30 PM ET', venue:'Hard Rock Stadium', city:'Miami Gardens', tags:[{l:'Group K',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 27', day:'Sat', num:'27', grp:'K', t1:'DR Congo', t2:'Uzbekistan', time:'7:30 PM ET', venue:'Mercedes-Benz Stadium', city:'Atlanta', tags:[{l:'Group K',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 27', day:'Sat', num:'27', grp:'J', t1:'Algeria', t2:'Austria', time:'10:00 PM ET', venue:'Arrowhead Stadium', city:'Kansas City', tags:[{l:'Group J',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 27', day:'Sat', num:'27', grp:'J', t1:'Jordan', t2:'Argentina', time:'10:00 PM ET', venue:'AT&T Stadium', city:'Arlington', tags:[{l:'Group J',c:'tag-group'},{l:'Final matchday',c:'tag-hot'}], played:false },
  { date:'Jun 28', day:'Sun', num:'28', grp:'R32', t1:'Runner-up A', t2:'Runner-up B', time:'3:00 PM ET', venue:'SoFi Stadium', city:'Los Angeles', tags:[{l:'Round of 32',c:'tag-knockout'}], played:false, knockout:true },
  { date:'Jun 29', day:'Mon', num:'29', grp:'R32', t1:'Winner C', t2:'Runner-up F', time:'1:00 PM ET', venue:'NRG Stadium', city:'Houston', tags:[{l:'Round of 32',c:'tag-knockout'}], played:false, knockout:true },
  { date:'Jun 29', day:'Mon', num:'29', grp:'R32', t1:'Winner E', t2:'Best 3rd', time:'4:30 PM ET', venue:'Gillette Stadium', city:'Foxborough', tags:[{l:'Round of 32',c:'tag-knockout'}], played:false, knockout:true },
  { date:'Jun 29', day:'Mon', num:'29', grp:'R32', t1:'Winner F', t2:'Runner-up C', time:'9:00 PM ET', venue:'Estadio BBVA', city:'Monterrey', tags:[{l:'Round of 32',c:'tag-knockout'}], played:false, knockout:true },
  { date:'Jun 30', day:'Tue', num:'30', grp:'R32', t1:'Runner-up E', t2:'Runner-up I', time:'1:00 PM ET', venue:'AT&T Stadium', city:'Arlington', tags:[{l:'Round of 32',c:'tag-knockout'}], played:false, knockout:true },
  { date:'Jul 1',  day:'Wed', num:'1',  grp:'R32', t1:'Winner L', t2:'Best 3rd', time:'12:00 PM ET', venue:'Mercedes-Benz Stadium', city:'Atlanta', tags:[{l:'Round of 32',c:'tag-knockout'}], played:false, knockout:true },
  { date:'Jul 2',  day:'Thu', num:'2',  grp:'R32', t1:'Winner H', t2:'Runner-up J', time:'3:00 PM ET', venue:'SoFi Stadium', city:'Los Angeles', tags:[{l:'Round of 32',c:'tag-knockout'}], played:false, knockout:true },
  { date:'Jul 3',  day:'Fri', num:'3',  grp:'R32', t1:'Winner K', t2:'Best 3rd', time:'9:30 PM ET', venue:'Arrowhead Stadium', city:'Kansas City', tags:[{l:'Round of 32',c:'tag-knockout'}], played:false, knockout:true },
  { date:'Jul 4',  day:'Sat', num:'4',  grp:'R16', t1:'TBD', t2:'TBD', time:'1:00 PM ET', venue:'NRG Stadium', city:'Houston', tags:[{l:'Round of 16',c:'tag-knockout'},{l:'High demand',c:'tag-urgent'}], played:false, knockout:true },
  { date:'Jul 4',  day:'Sat', num:'4',  grp:'R16', t1:'TBD', t2:'TBD', time:'5:00 PM ET', venue:'Lincoln Financial Field', city:'Philadelphia', tags:[{l:'Round of 16',c:'tag-knockout'},{l:'High demand',c:'tag-urgent'}], played:false, knockout:true },
  { date:'Jul 5',  day:'Sun', num:'5',  grp:'R16', t1:'TBD', t2:'TBD', time:'4:00 PM ET', venue:'MetLife Stadium', city:'East Rutherford', tags:[{l:'Round of 16',c:'tag-knockout'},{l:'High demand',c:'tag-urgent'}], played:false, knockout:true },
  { date:'Jul 6',  day:'Mon', num:'6',  grp:'R16', t1:'TBD', t2:'TBD', time:'3:00 PM ET', venue:'AT&T Stadium', city:'Arlington', tags:[{l:'Round of 16',c:'tag-knockout'},{l:'High demand',c:'tag-urgent'}], played:false, knockout:true },
  { date:'Jul 7',  day:'Tue', num:'7',  grp:'R16', t1:'TBD', t2:'TBD', time:'12:00 PM ET', venue:'Mercedes-Benz Stadium', city:'Atlanta', tags:[{l:'Round of 16',c:'tag-knockout'},{l:'High demand',c:'tag-urgent'}], played:false, knockout:true },
  { date:'Jul 9',  day:'Thu', num:'9',  grp:'QF', t1:'TBD', t2:'TBD', time:'TBD', venue:'SoFi Stadium', city:'Los Angeles', tags:[{l:'Quarterfinal',c:'tag-knockout'},{l:'Selling fast',c:'tag-urgent'}], played:false, knockout:true },
  { date:'Jul 10', day:'Fri', num:'10', grp:'QF', t1:'TBD', t2:'TBD', time:'TBD', venue:'MetLife Stadium', city:'East Rutherford', tags:[{l:'Quarterfinal',c:'tag-knockout'},{l:'Selling fast',c:'tag-urgent'}], played:false, knockout:true },
  { date:'Jul 11', day:'Sat', num:'11', grp:'QF', t1:'TBD', t2:'TBD', time:'TBD', venue:'AT&T Stadium', city:'Arlington', tags:[{l:'Quarterfinal',c:'tag-knockout'},{l:'Selling fast',c:'tag-urgent'}], played:false, knockout:true },
  { date:'Jul 14', day:'Tue', num:'14', grp:'SF', t1:'TBD', t2:'TBD', time:'TBD', venue:'Hard Rock Stadium', city:'Miami Gardens', tags:[{l:'Semifinal',c:'tag-knockout'},{l:'Only 2% left',c:'tag-urgent'}], played:false, knockout:true },
  { date:'Jul 15', day:'Wed', num:'15', grp:'SF', t1:'TBD', t2:'TBD', time:'TBD', venue:'AT&T Stadium', city:'Arlington', tags:[{l:'Semifinal',c:'tag-knockout'},{l:'Only 2% left',c:'tag-urgent'}], played:false, knockout:true },
  { date:'Jul 18', day:'Sat', num:'18', grp:'3P', t1:'TBD', t2:'TBD', time:'5:00 PM ET', venue:'Hard Rock Stadium', city:'Miami Gardens', tags:[{l:'Third-place match',c:'tag-knockout'}], played:false, knockout:true },
  { date:'Jul 19', day:'Sun', num:'19', grp:'FINAL', t1:'TBD', t2:'TBD', time:'3:00 PM ET', venue:'MetLife Stadium', city:'East Rutherford', tags:[{l:'World Cup Final',c:'tag-hot'},{l:'Extremely limited',c:'tag-urgent'}], played:false, knockout:true },
];

const STAGE_LABELS = {
  R32:'Round of 32', R16:'Round of 16',
  QF:'Quarterfinals', SF:'Semifinals',
  '3P':'Third-place match', FINAL:'World Cup Final',
};

const FILTERS = [
  { key:'all',       label:'All matches' },
  { key:'upcoming',  label:'Upcoming' },
  { key:'played',    label:'Played' },
  { key:'_div' },
  { key:'USA',       label:'USA' },
  { key:'Mexico',    label:'Mexico' },
  { key:'Canada',    label:'Canada' },
  { key:'Brazil',    label:'Brazil' },
  { key:'England',   label:'England' },
  { key:'Argentina', label:'Argentina' },
  { key:'Germany',   label:'Germany' },
  { key:'France',    label:'France' },
  { key:'_div' },
  { key:'knockout',  label:'Knockout stage' },
];

function FlagImg({ team }) {
  const code = ISO[team];
  if (!code) return <span className="wc-flag wc-flag-unknown">?</span>;
  return (
    <img className="wc-flag" src={flagUrl(code)} alt={team}
      onError={e => { e.target.style.opacity = 0; }} />
  );
}

function Tag({ tag }) {
  return <span className={`wc-tag wc-${tag.c}`}>{tag.l}</span>;
}

function MatchCard({ match: m }) {
  const [checkout, setCheckout] = useState(false);
  const isKnown = name =>
    !['TBD','Winner','Runner-up','Best'].some(x => name.startsWith(x));

  return (
    <li className={`wc-card${m.played ? ' wc-card-played' : ''}`}>
      <div className="wc-card-date">
        <span className="wc-date-mon">{m.date.split(' ')[0]}</span>
        <span className="wc-date-num">{m.num}</span>
        <span className="wc-date-day">{m.day}</span>
      </div>
      <div className="wc-card-body">
        <div className="wc-matchup">
          <span className="wc-team">
            {isKnown(m.t1) ? <FlagImg team={m.t1} /> : <span className="wc-flag wc-flag-unknown">?</span>}
            {m.t1}
          </span>
          <span className="wc-vs">vs.</span>
          <span className="wc-team">
            {isKnown(m.t2) ? <FlagImg team={m.t2} /> : <span className="wc-flag wc-flag-unknown">?</span>}
            {m.t2}
          </span>
          {m.played
            ? <span className="wc-score">{m.result}</span>
            : <span className="wc-time">{m.time || 'TBD'}</span>}
        </div>
        <div className="wc-meta">
          <span>{m.venue}</span><span>{m.city}</span>
        </div>
        <div className="wc-tags">
          {m.tags.map((t, i) => <Tag key={i} tag={t} />)}
        </div>
      </div>
      <div className="wc-card-action">
        {m.played
          ? <button className="wc-btn wc-btn-played" disabled>Played</button>
          : <button className="wc-btn" onClick={() => setCheckout(true)}>See tickets</button>}
      </div>
      {checkout && <CheckoutModal match={m} onClose={() => setCheckout(false)} />}
    </li>
  );
}

function SectionLabel({ date, match }) {
  const prefix = match.played ? '✓ ' : '';
  const stageLabel = match.knockout && STAGE_LABELS[match.grp]
    ? `${STAGE_LABELS[match.grp]} — ` : '';
  return <li className="wc-section-label">{prefix}{stageLabel}{date}</li>;
}

export default function App() {
  const [matches, setMatches] = useState(ALL_MATCHES);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  // ── LIVE SCORES API & TIME LOGIC ─────────────────────────────────────────────
  useEffect(() => {
    // 1. INSTANT TIME CHECK (Runs immediately, ignoring the API entirely)
    const today = new Date();
    setMatches(prevMatches => prevMatches.map(m => {
      const matchDateStr = `${m.date}, 2026`;
      // If the match date is in the past, instantly lock it as "Played"
      if (new Date(matchDateStr) < today && !m.played) {
        return { ...m, played: true, result: m.result || "TBD" };
      }
      return m;
    }));

    // 2. LIVE SCORE OVERLAY (Runs asynchronously)
    const fetchLiveScores = async () => {
      try {
        const response = await fetch("https://v3.football.api-sports.io/fixtures?league=1&season=2026", {
          method: "GET",
          headers: {
            // 🔥 REMEMBER TO PASTE YOUR FREE API KEY HERE:
            "x-apisports-key": "edd80e28bac87cfa81cd65a639e9db89",
            "Accept": "application/json"
          }
        });
        
        if (!response.ok) return; // If API fails, it no longer breaks the time logic!
        const data = await response.json();
        
        if (data.response && data.response.length > 0) {
          setMatches(currentMatches => currentMatches.map(m => {
            const apiTeam1 = getApiTeamName(m.t1);
            const apiTeam2 = getApiTeamName(m.t2);

            const liveMatch = data.response.find(apiMatch => 
              (apiMatch.teams.home.name.includes(apiTeam1) || apiMatch.teams.away.name.includes(apiTeam1)) &&
              (apiMatch.teams.home.name.includes(apiTeam2) || apiMatch.teams.away.name.includes(apiTeam2))
            );

            if (liveMatch) {
              const status = liveMatch.fixture.status.short;
              const isFinished = ['FT', 'AET', 'PEN'].includes(status);
              const isLive = ['1H', 'HT', '2H', 'ET', 'BT', 'P'].includes(status);
              
              let newTags = [...m.tags];
              if (isLive) {
                newTags = newTags.filter(t => t.c !== 'tag-hot');
                newTags.unshift({ l: `LIVE: ${liveMatch.fixture.status.elapsed}'`, c: 'tag-hot' });
              }

              return {
                ...m,
                played: isFinished || m.played, // Respect the time check we did earlier
                result: isFinished || isLive 
                  ? `${liveMatch.goals.home ?? 0}–${liveMatch.goals.away ?? 0}` 
                  : m.result,
                tags: newTags
              };
            }
            return m;
          }));
        }
      } catch (err) {
        console.error("Live score update failed:", err);
      }
    };

    fetchLiveScores(); 
    const interval = setInterval(fetchLiveScores, 60000); // Refreshes API every 60 seconds
    
    return () => clearInterval(interval);
  }, []);
  // ────────────────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return matches.filter(m => {
      const searchOk = !q ||
        m.t1.toLowerCase().includes(q) || m.t2.toLowerCase().includes(q) ||
        m.venue.toLowerCase().includes(q) || m.city.toLowerCase().includes(q) ||
        m.grp.toLowerCase().includes(q);
      let filterOk = true;
      if (activeFilter === 'upcoming')      filterOk = !m.played;
      else if (activeFilter === 'played')   filterOk = m.played;
      else if (activeFilter === 'knockout') filterOk = !!m.knockout;
      else if (activeFilter !== 'all')
        filterOk = m.t1.includes(activeFilter) || m.t2.includes(activeFilter);
      return searchOk && filterOk;
    });
  }, [matches, activeFilter, search]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(m => {
      if (!map.has(m.date)) map.set(m.date, []);
      map.get(m.date).push(m);
    });
    return map;
  }, [filtered]);

  return (
    <div className="wc-app">

      {/* ── Navbar replaces the old <header> block ── */}
      <Navbar search={search} onSearch={setSearch} />

      <div className="wc-hero">
        <div className="wc-hero-eyebrow">🏆 FIFA World Cup 2026</div>
        <h1>Your seat at the World Cup is waiting</h1>
        <p>48 teams · 104 matches · USA, Canada &amp; Mexico</p>
        <div className="wc-hero-pills">
          <span className="wc-pill"><span className="wc-live-dot" />Live now</span>
          <span className="wc-pill"><b>104</b> total matches</span>
          <span className="wc-pill"><b>16</b> stadiums</span>
          <span className="wc-pill">Final: <b>Jul 19, MetLife</b></span>
        </div>
      </div>

      <div className="wc-filters">
        {FILTERS.map((f, i) =>
          f.key === '_div'
            ? <div key={i} className="wc-filter-divider" />
            : (
              <button key={f.key}
                className={`wc-filter-btn${activeFilter === f.key ? ' active' : ''}`}
                onClick={() => setActiveFilter(f.key)}>
                {f.label}
              </button>
            )
        )}
      </div>

      <main className="wc-main">
        <div className="wc-list-header">
          <span className="wc-count">
            <strong>{filtered.length}</strong> match{filtered.length !== 1 ? 'es' : ''}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="wc-empty">No matches found — try a different filter</div>
        ) : (
          <ul className="wc-list">
            {[...grouped.entries()].map(([date, matchesGroup]) => (
              <React.Fragment key={date}>
                <SectionLabel date={date} match={matchesGroup[0]} />
                {matchesGroup.map((m, i) => <MatchCard key={`${date}-${i}`} match={m} />)}
              </React.Fragment>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}