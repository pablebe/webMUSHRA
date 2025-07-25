/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

function DCRP808AudioControl(_audioContext, _bufferSize, _reference, _conditions, _errorHandler, _createAnchor35, _createAnchor70, _randomize, _switchBack) {
    this.audioContext = _audioContext;
    this.bufferSize = parseInt(_bufferSize);
    this.reference = _reference;
    this.conditions = _conditions;    
    this.errorHandler = _errorHandler;
    this.createAnchor35 = _createAnchor35;
    this.createAnchor70 = _createAnchor70;
    this.switchBack = _switchBack;
    this.lowAnchor = null;
    this.midAnchor = null;
    
    this.audioPlaying = false;
    this.audioCurrentPosition = 0;
    this.audioSampleRate = null;
    this.audioLoopStart = 0;
    this.audioLoopEnd = null;  
    this.audioMaxPosition = null;
    this.audioStimulus = null;
    this.audioLoopingActive = true;
    
    this.audioFadingActive = 0; // 0 = no, 1 = fade_out, 2 = fade_in
    this.audioFadingIn = null;
    this.audioFadingCurrentPosition = 0;
    this.audioFadingMaxPosition = parseInt(audioContext.sampleRate * 0.0);    
    this.audioMinimumLoopDuration = parseInt(audioContext.sampleRate * 0.5);    
    this.audioVolume = 1.0;
    this.audioIsReferencePlaying = null;
    
    // requests
    this.audioCurrentPositionRequest = null; 
    this.audioFadingActiveRequest = null;
    
    //listeners
    this.eventListeners = [];
  
    this.conditions[this.conditions.length] = this.reference;  
    
    // add anchors
    if (this.createAnchor35) {
      this.conditions[this.conditions.length] = this.createLowerAnchor35(this.reference.getAudioBuffer());
    }
    if (this.createAnchor70) {
      this.conditions[this.conditions.length] = this.createLowerAnchor70(this.reference.getAudioBuffer());
    }
  
    if (_randomize !== false) { // default is true
      shuffle(this.conditions);
    }
    var conditionsMinLength = Math.min.apply(null, this.conditions.map(function(item) { return item.getAudioBuffer().length; }));
    var safeAudioLength = this.reference.getAudioBuffer().length//Math.min(conditionsMinLength, this.reference.getAudioBuffer().length);
  
    this.audioLoopEnd = safeAudioLength;
    this.audioMaxPosition = safeAudioLength;
    this.audioSampleRate = this.reference.getAudioBuffer().sampleRate;
    this.refPlayed = false;
  }
  
  
  
  
  DCRP808AudioControl.prototype.createLowerAnchor35 = function(_reference) {
    var anchor35 = new Stimulus("anchor35", null);
    var lowpass_35 =  {
      "16000": [0.00146057475,-0.000353625658,-0.00211669048,1.33181901e-17,0.00283327134,0.00063539025,-0.00354377515,-0.00160293357,0.00415933602,0.00293859058,-0.00456995224,-0.00465872931,0.00464644276,0.00675606346,-0.00424229906,-0.00919716509,0.00319389291,0.0119219071,-0.00131632725,-0.0148450328,-0.00161017158,0.017859864,0.00587395476,-0.0208439639,-0.0119108739,0.0236663818,0.0204970606,-0.0261959511,-0.0332797851,0.028309993,0.0545868177,-0.029902726,-0.100469275,0.0308926832,0.316213188,0.468427729,0.316213188,0.0308926832,-0.100469275,-0.029902726,0.0545868177,0.028309993,-0.0332797851,-0.0261959511,0.0204970606,0.0236663818,-0.0119108739,-0.0208439639,0.00587395476,0.017859864,-0.00161017158,-0.0148450328,-0.00131632725,0.0119219071,0.00319389291,-0.00919716509,-0.00424229906,0.00675606346,0.00464644276,-0.00465872931,-0.00456995224,0.00293859058,0.00415933602,-0.00160293357,-0.00354377515,0.00063539025,0.00283327134,1.33181901e-17,-0.00211669048,-0.000353625658,0.00146057475],
      "22050": [0.000952605741,-540270522e-13,-0.00127762947,-0.00131042292,0.000190025918,0.00182536152,0.00170992319,-0.000409988577,-0.00250271626,-0.00214566819,0.000737474512,0.00332812369,0.00261061454,-0.00120067309,-0.00432364806,-0.00309626869,0.00183427383,0.00551743347,0.0035929075,-0.00268271981,-0.00694789149,-0.00408985769,0.00380597669,0.00867104429,0.00457582413,-0.00529011523,-0.0107739692,-0.00503925474,0.00726774322,0.013401003,0.00546872754,-0.00996041093,-0.0168093503,-0.00585334427,0.0137758737,0.0215014677,0.00618311408,-0.0195648167,-0.0285953063,-0.00644931146,0.0294554368,0.0411458005,0.00664479278,-0.0506925442,-0.0714114073,-0.00676425808,0.134027797,0.278911088,0.340222334,0.278911088,0.134027797,-0.00676425808,-0.0714114073,-0.0506925442,0.00664479278,0.0411458005,0.0294554368,-0.00644931146,-0.0285953063,-0.0195648167,0.00618311408,0.0215014677,0.0137758737,-0.00585334427,-0.0168093503,-0.00996041093,0.00546872754,0.013401003,0.00726774322,-0.00503925474,-0.0107739692,-0.00529011523,0.00457582413,0.00867104429,0.00380597669,-0.00408985769,-0.00694789149,-0.00268271981,0.0035929075,0.00551743347,0.00183427383,-0.00309626869,-0.00432364806,-0.00120067309,0.00261061454,0.00332812369,0.000737474512,-0.00214566819,-0.00250271626,-0.000409988577,0.00170992319,0.00182536152,0.000190025918,-0.00131042292,-0.00127762947,-540270522e-13,0.000952605741],
      "32000": [0.000606868162,0.000143747395,-0.000489683231,-0.000957379936,-0.000960325242,-0.000417728904,0.000449945168,0.00120031549,0.00138937936,0.000825904537,-0.00028215794,-0.00138886266,-0.0018728162,-0.0013784479,-521614709e-13,0.00147437405,0.00237664707,0.00207495799,0.000588782307,-0.00140129392,-0.00285363105,-0.00290225508,-0.00135803188,0.00110897785,0.0032433065,0.00383275857,0.00238254276,-0.000533301611,-0.00347219682,-0.00482346902,-0.00367593495,-0.000392692298,0.0034535061,0.00581536918,0.00524301539,0.00174034066,-0.00308500074,-0.00673269714,-0.00708234698,-0.00359130075,0.00224251785,0.00748083884,0.00919271334,0.00605234225,-0.000763633833,-0.00793999457,-0.0115868202,-0.00928931164,-0.00159164371,0.00794756191,0.0143209098,0.0136079502,0.00523968294,-0.00724896864,-0.0175669342,-0.0196698839,-0.0110538132,0.00534562546,0.0218284858,0.0292009619,0.0213598555,-0.000901475403,-0.0288345136,-0.0483076339,-0.0452805665,-0.0120351498,0.0485303746,0.122599703,0.189585306,0.229288491,0.229288491,0.189585306,0.122599703,0.0485303746,-0.0120351498,-0.0452805665,-0.0483076339,-0.0288345136,-0.000901475403,0.0213598555,0.0292009619,0.0218284858,0.00534562546,-0.0110538132,-0.0196698839,-0.0175669342,-0.00724896864,0.00523968294,0.0136079502,0.0143209098,0.00794756191,-0.00159164371,-0.00928931164,-0.0115868202,-0.00793999457,-0.000763633833,0.00605234225,0.00919271334,0.00748083884,0.00224251785,-0.00359130075,-0.00708234698,-0.00673269714,-0.00308500074,0.00174034066,0.00524301539,0.00581536918,0.0034535061,-0.000392692298,-0.00367593495,-0.00482346902,-0.00347219682,-0.000533301611,0.00238254276,0.00383275857,0.0032433065,0.00110897785,-0.00135803188,-0.00290225508,-0.00285363105,-0.00140129392,0.000588782307,0.00207495799,0.00237664707,0.00147437405,-521614709e-13,-0.0013784479,-0.0018728162,-0.00138886266,-0.00028215794,0.000825904537,0.00138937936,0.00120031549,0.000449945168,-0.000417728904,-0.000960325242,-0.000957379936,-0.000489683231,0.000143747395,0.000606868162],
      "44100": [0.000385585487,0.000133034743,-0.000194118449,-0.000505722104,-0.000704834248,-0.000716894007,-0.000515420887,-0.000135834153,0.000328234037,0.000746924123,0.000989641735,0.000964595401,0.000650699563,0.000111322602,-0.000516136594,-0.00105407906,-0.00133398588,-0.00124774623,-0.000785754644,-490812421e-13,0.000770326741,0.00143838339,0.00174455797,0.00156640738,0.000913606436,-634018697e-13,-0.0011057284,-0.00191319916,-0.00222936025,-0.00192063974,-0.00102578505,0.000241433178,0.00154080481,0.00249532689,0.00279877877,0.00231100982,0.00111200144,-0.000504343499,-0.0020994943,-0.00320719753,-0.00346741253,-0.00273942131,-0.00115952039,0.000877685355,0.00281463346,0.00408072966,0.00425727013,0.00321052111,0.00115194504,-0.00139728242,-0.00373423174,-0.00516439618,-0.00520361645,-0.00373421028,-0.00106679354,0.00211705467,0.00493360865,0.00653696348,0.00636639211,0.00433049385,0.000870420254,-0.00312520748,-0.00654071007,-0.00833647519,-0.00785458392,-0.00503985239,-0.000506491547,0.00458108702,0.00879468,0.0108285771,0.00988481876,0.0059485687,-0.000133497735,-0.00681123281,-0.0122025771,-0.0145947015,-0.0129478282,-0.00726293801,0.00130073897,0.0106152311,0.0180600648,0.02118718,0.0184183105,0.00959660845,-0.00376347351,-0.0186204222,-0.0309450406,-0.0365583033,-0.0320911389,-0.015848259,0.0116325554,0.0474743894,0.0868589947,0.123865178,0.15258148,0.16825952,0.16825952,0.15258148,0.123865178,0.0868589947,0.0474743894,0.0116325554,-0.015848259,-0.0320911389,-0.0365583033,-0.0309450406,-0.0186204222,-0.00376347351,0.00959660845,0.0184183105,0.02118718,0.0180600648,0.0106152311,0.00130073897,-0.00726293801,-0.0129478282,-0.0145947015,-0.0122025771,-0.00681123281,-0.000133497735,0.0059485687,0.00988481876,0.0108285771,0.00879468,0.00458108702,-0.000506491547,-0.00503985239,-0.00785458392,-0.00833647519,-0.00654071007,-0.00312520748,0.000870420254,0.00433049385,0.00636639211,0.00653696348,0.00493360865,0.00211705467,-0.00106679354,-0.00373421028,-0.00520361645,-0.00516439618,-0.00373423174,-0.00139728242,0.00115194504,0.00321052111,0.00425727013,0.00408072966,0.00281463346,0.000877685355,-0.00115952039,-0.00273942131,-0.00346741253,-0.00320719753,-0.0020994943,-0.000504343499,0.00111200144,0.00231100982,0.00279877877,0.00249532689,0.00154080481,0.000241433178,-0.00102578505,-0.00192063974,-0.00222936025,-0.00191319916,-0.0011057284,-634018697e-13,0.000913606436,0.00156640738,0.00174455797,0.00143838339,0.000770326741,-490812421e-13,-0.000785754644,-0.00124774623,-0.00133398588,-0.00105407906,-0.000516136594,0.000111322602,0.000650699563,0.000964595401,0.000989641735,0.000746924123,0.000328234037,-0.000135834153,-0.000515420887,-0.000716894007,-0.000704834248,-0.000505722104,-0.000194118449,0.000133034743,0.000385585487],
      "48000": [0.000265962912,269444584e-13,-0.000248821161,-0.000494662851,-0.000643796534,-0.000646775759,-0.000486311783,-0.00018528049,0.000194893397,0.000566035055,0.000833148354,0.00091809972,0.000781287127,0.000435505261,-522979429e-13,-0.000572944907,-0.000998822202,-0.00121452462,-0.00114713457,-0.000788392101,-0.000202420545,0.000484181162,0.00110885003,0.00151084654,0.00157170064,0.00124833405,0.000589933696,-0.000266953314,-0.00112557915,-0.00177332628,-0.00203342793,-0.00181170379,-0.00112625841,-0.000111457054,0.00100671953,0.00195990923,0.00250073799,0.00246559981,0.00182121733,0.00068227443,-0.000706303532,-0.00202053023,-0.00293168746,-0.00318704737,-0.00267749645,-0.00147446748,0.000175042337,0.00189701892,0.00327357683,0.00394261376,0.00369060569,0.00251528679,0.000640787624,-0.00152170555,-0.00346182551,-0.00468821039,-0.00485014653,-0.00383316972,-0.00180350513,0.000812985611,0.00341669253,0.00536850308,0.00614306024,0.00546508185,0.00339445006,0.000335843306,-0.00303472869,-0.00591458059,-0.00756029023,-0.00747297626,-0.0055381722,-0.00208327545,0.00216735243,0.00623652135,0.00911056463,0.00998170297,0.00846059896,0.00470613719,-0.000565026394,-0.00620120019,-0.0108526668,-0.0132768685,-0.0126461656,-0.00878669367,-0.00228687538,0.00556114655,0.0129890766,0.0181131879,0.0193598332,0.0158676325,0.00777636434,-0.00366989653,-0.0162436399,-0.0270725072,-0.0331434635,-0.0318828143,-0.0217012916,-0.00239409277,0.0246911341,0.0567636975,0.0899696543,0.119982256,0.142700869,0.154932754,0.154932754,0.142700869,0.119982256,0.0899696543,0.0567636975,0.0246911341,-0.00239409277,-0.0217012916,-0.0318828143,-0.0331434635,-0.0270725072,-0.0162436399,-0.00366989653,0.00777636434,0.0158676325,0.0193598332,0.0181131879,0.0129890766,0.00556114655,-0.00228687538,-0.00878669367,-0.0126461656,-0.0132768685,-0.0108526668,-0.00620120019,-0.000565026394,0.00470613719,0.00846059896,0.00998170297,0.00911056463,0.00623652135,0.00216735243,-0.00208327545,-0.0055381722,-0.00747297626,-0.00756029023,-0.00591458059,-0.00303472869,0.000335843306,0.00339445006,0.00546508185,0.00614306024,0.00536850308,0.00341669253,0.000812985611,-0.00180350513,-0.00383316972,-0.00485014653,-0.00468821039,-0.00346182551,-0.00152170555,0.000640787624,0.00251528679,0.00369060569,0.00394261376,0.00327357683,0.00189701892,0.000175042337,-0.00147446748,-0.00267749645,-0.00318704737,-0.00293168746,-0.00202053023,-0.000706303532,0.00068227443,0.00182121733,0.00246559981,0.00250073799,0.00195990923,0.00100671953,-0.000111457054,-0.00112625841,-0.00181170379,-0.00203342793,-0.00177332628,-0.00112557915,-0.000266953314,0.000589933696,0.00124833405,0.00157170064,0.00151084654,0.00110885003,0.000484181162,-0.000202420545,-0.000788392101,-0.00114713457,-0.00121452462,-0.000998822202,-0.000572944907,-522979429e-13,0.000435505261,0.000781287127,0.00091809972,0.000833148354,0.000566035055,0.000194893397,-0.00018528049,-0.000486311783,-0.000646775759,-0.000643796534,-0.000494662851,-0.000248821161,269444584e-13,0.000265962912]
    };
    var lowpass = lowpass_35[(_reference.sampleRate).toString()];
    if (lowpass === null) {
      this.errorHandler.sendError("Sample size" + _reference.sampleRate + " is not supported for creating anchors.");
      return null;
    }
    anchor35.setAudioBuffer(this.convolve(_reference, lowpass));
    return anchor35;  
  };
  
  DCRP808AudioControl.prototype.createLowerAnchor70 = function(_reference) {
    var anchor70 = new Stimulus("anchor70", null);  
    var lowpass_70 = {
      "16000": [-0.00118209226,0.00100896033,-0.000618592779,-3.0648982e-21,0.000828010143,-0.00181288756,0.0028680964,-0.00387720074,0.00470245853,-0.00519757939,0.00522375966,-0.00466760994,0.00345919995,-0.00158821811,-0.000883779279,0.00381685249,-0.00699329572,0.0101261709,-0.012875787,0.0148733309,-0.0157500548,0.0151697236,-0.0128615154,0.00865031066,-0.00248133933,-0.00556350253,0.0152597233,-0.0262458867,0.03804101,-0.0500727925,0.0617147172,-0.0723291806,0.0813131625,-0.0881426193,0.0924118081,0.907353278,0.0924118081,-0.0881426193,0.0813131625,-0.0723291806,0.0617147172,-0.0500727925,0.03804101,-0.0262458867,0.0152597233,-0.00556350253,-0.00248133933,0.00865031066,-0.0128615154,0.0151697236,-0.0157500548,0.0148733309,-0.012875787,0.0101261709,-0.00699329572,0.00381685249,-0.000883779279,-0.00158821811,0.00345919995,-0.00466760994,0.00522375966,-0.00519757939,0.00470245853,-0.00387720074,0.0028680964,-0.00181288756,0.000828010143,-3.0648982e-21,-0.000618592779,0.00100896033,-0.00118209226],
      "22050": [-0.00109204743,0.000364387668,0.00100704951,-0.00153304385,0.000365790771,0.00151198395,-0.0020376718,0.000291370261,0.00216171702,-0.00260011167,0.000112849298,0.0029784736,-0.00321181316,-0.000203222908,0.00398744555,-0.00386164534,-0.000697103657,0.00521902698,-0.00453617643,-0.00141884616,0.00671283398,-0.00522007536,-0.00243379393,0.00852493523,-0.00589662042,-0.00383289594,0.0107412503,-0.00654829386,-0.00575289893,0.0135037854,-0.00715743651,-0.00841856686,0.0170663665,-0.0077069323,-0.0122398534,0.0219272797,-0.00818089034,-0.0180687354,0.0292000372,-0.00856529187,-0.0280344748,0.0419362692,-0.00884857023,-0.0493861012,0.0723989052,-0.00902209522,-0.132916342,0.280240308,0.658338972,0.280240308,-0.132916342,-0.00902209522,0.0723989052,-0.0493861012,-0.00884857023,0.0419362692,-0.0280344748,-0.00856529187,0.0292000372,-0.0180687354,-0.00818089034,0.0219272797,-0.0122398534,-0.0077069323,0.0170663665,-0.00841856686,-0.00715743651,0.0135037854,-0.00575289893,-0.00654829386,0.0107412503,-0.00383289594,-0.00589662042,0.00852493523,-0.00243379393,-0.00522007536,0.00671283398,-0.00141884616,-0.00453617643,0.00521902698,-0.000697103657,-0.00386164534,0.00398744555,-0.000203222908,-0.00321181316,0.0029784736,0.000112849298,-0.00260011167,0.00216171702,0.000291370261,-0.0020376718,0.00151198395,0.000365790771,-0.00153304385,0.00100704951,0.000364387668,-0.00109204743],
      "32000": [-0.000769448174,-0.000102908895,0.000882007876,0.000402489768,-0.000908180556,-0.000758018375,0.000816478586,0.00113513958,-0.000584105594,-0.00148760313,0.000201997134,0.00176093904,0.000321000527,-0.00189789137,-0.000955484664,0.00184520796,0.00165095747,-0.00156116233,-0.00233779021,0.00102301221,0.0029318393,-0.000233502393,-0.00334157226,-0.000774482154,0.0034772551,0.00193590651,-0.00326146644,-0.00315481067,0.00263997272,0.00430907238,-0.00159185405,-0.00525866243,0.000137737071,0.00585697226,0.00165491779,-0.00596443449,-0.00367031062,0.00546335487,0.00574708382,-0.00427266973,-0.00768547855,0.00236126969,0.0092584779,0.000241387121,-0.0102260537,-0.00343839395,0.0103511491,0.00706282811,-0.00941556234,-0.0108794297,0.0072334174,0.014589529,-0.00365926237,-0.017836807,-0.00141335654,0.020208968,0.00806981719,-0.0212250788,-0.0164233734,0.0202846888,0.0267322768,-0.0165130681,-0.0397002851,0.00827992408,0.0574112325,0.00861597499,-0.0874119634,-0.0515418427,0.179291016,0.416071015,0.416071015,0.179291016,-0.0515418427,-0.0874119634,0.00861597499,0.0574112325,0.00827992408,-0.0397002851,-0.0165130681,0.0267322768,0.0202846888,-0.0164233734,-0.0212250788,0.00806981719,0.020208968,-0.00141335654,-0.017836807,-0.00365926237,0.014589529,0.0072334174,-0.0108794297,-0.00941556234,0.00706282811,0.0103511491,-0.00343839395,-0.0102260537,0.000241387121,0.0092584779,0.00236126969,-0.00768547855,-0.00427266973,0.00574708382,0.00546335487,-0.00367031062,-0.00596443449,0.00165491779,0.00585697226,0.000137737071,-0.00525866243,-0.00159185405,0.00430907238,0.00263997272,-0.00315481067,-0.00326146644,0.00193590651,0.0034772551,-0.000774482154,-0.00334157226,-0.000233502393,0.0029318393,0.00102301221,-0.00233779021,-0.00156116233,0.00165095747,0.00184520796,-0.000955484664,-0.00189789137,0.000321000527,0.00176093904,0.000201997134,-0.00148760313,-0.000584105594,0.00113513958,0.000816478586,-0.000758018375,-0.000908180556,0.000402489768,0.000882007876,-0.000102908895,-0.000769448174],
      "44100": [-0.000532571035,-0.000132887083,0.000459904635,0.000651259705,0.000189344568,-0.000526843122,-0.000783572104,-0.000259251594,0.000593819841,0.000930096627,0.000344234469,-0.000659745775,-0.00109139499,-0.000446021415,0.00072340291,0.00126800749,0.000566454777,-0.000783437815,-0.00146046149,-0.000707508266,0.00083835339,0.00166928376,0.000871310809,-0.000886497904,-0.0018950178,-0.00106017909,0.00092605019,0.00213824725,0.0012766615,-0.000954999454,-0.00239962702,-0.00152359736,0.000971117574,0.00267992457,0.00180419637,-0.000971920987,-0.00298007442,-0.00212214573,0.000954618037,0.00330125036,0.00248175508,-0.000916035917,-0.00364496198,-0.0028881542,0.000852518629,0.00401318497,0.00334756566,-0.000759783224,-0.00440853985,-0.00386768584,0.000632714888,0.00483454113,0.0044582262,-0.000465070593,-0.00529595233,-0.00513169752,0.000249042659,0.00579930374,0.00590457233,253982932e-13,-0.00635366889,-0.00679905528,-0.000371519121,0.00697186608,0.00784586582,0.000807445389,-0.00767238735,-0.00908877832,-0.00135884995,0.0084826305,0.0105923658,0.00206362319,-0.00944459856,-0.0124559362,-0.00298045962,0.0106255937,0.0148403291,0.00420580554,-0.0121398987,-0.0180239389,-0.00591049403,0.0141973598,0.0225334267,0.00842914035,-0.0172279931,-0.0294984949,-0.0125189233,0.0222704419,0.0418581019,0.020334996,-0.0326317143,-0.0703914922,-0.0414222929,0.0674969577,0.212121469,0.314412351,0.314412351,0.212121469,0.0674969577,-0.0414222929,-0.0703914922,-0.0326317143,0.020334996,0.0418581019,0.0222704419,-0.0125189233,-0.0294984949,-0.0172279931,0.00842914035,0.0225334267,0.0141973598,-0.00591049403,-0.0180239389,-0.0121398987,0.00420580554,0.0148403291,0.0106255937,-0.00298045962,-0.0124559362,-0.00944459856,0.00206362319,0.0105923658,0.0084826305,-0.00135884995,-0.00908877832,-0.00767238735,0.000807445389,0.00784586582,0.00697186608,-0.000371519121,-0.00679905528,-0.00635366889,253982932e-13,0.00590457233,0.00579930374,0.000249042659,-0.00513169752,-0.00529595233,-0.000465070593,0.0044582262,0.00483454113,0.000632714888,-0.00386768584,-0.00440853985,-0.000759783224,0.00334756566,0.00401318497,0.000852518629,-0.0028881542,-0.00364496198,-0.000916035917,0.00248175508,0.00330125036,0.000954618037,-0.00212214573,-0.00298007442,-0.000971920987,0.00180419637,0.00267992457,0.000971117574,-0.00152359736,-0.00239962702,-0.000954999454,0.0012766615,0.00213824725,0.00092605019,-0.00106017909,-0.0018950178,-0.000886497904,0.000871310809,0.00166928376,0.00083835339,-0.000707508266,-0.00146046149,-0.000783437815,0.000566454777,0.00126800749,0.00072340291,-0.000446021415,-0.00109139499,-0.000659745775,0.000344234469,0.000930096627,0.000593819841,-0.000259251594,-0.000783572104,-0.000526843122,0.000189344568,0.000651259705,0.000459904635,-0.000132887083,-0.000532571035],
      "48000": [-0.000382564326,626346183e-13,0.00050768613,0.000555633678,0.000116282009,-0.000476780129,-0.000714904767,-0.000347718209,0.000365758872,0.000832102312,0.00061416739,-0.000165826429,-0.0008775865,-0.000888589942,-0.000121570886,0.000824131005,0.00113600937,0.000482705267,-0.000651095587,-0.00131644851,-0.000890743918,0.000348525498,0.00138905036,0.00130643989,793456875e-13,-0.00131706068,-0.00168049112,-0.000611711544,0.0010732018,0.00195754148,0.00121038371,-0.000644859068,-0.00208160065,-0.00182088957,384493874e-13,0.00200246734,0.00237562998,0.000717642614,-0.00168257606,-0.00279903645,-0.00157208738,0.00110357317,0.00301443897,0.00245196246,-0.000271881056,-0.00295213872,-0.00326659165,-0.000777458991,0.00255799998,0.00391378054,0.00197926022,-0.00180175714,-0.00428809769,-0.00323938485,0.000684194667,0.00429060879,0.00443881131,0.000757587079,-0.00383927574,-0.00544043235,-0.00244745458,0.0028791113,0.00609813465,0.00427046011,-0.00139115414,-0.00626741483,-0.00607605131,-0.000600584332,0.00581652723,0.00768391283,0.00302483882,-0.00463694558,-0.00889158112,-0.00576176238,0.00265173991,0.00948233399,0.00864431517,0.000179740322,-0.00923091568,-0.0114613327,-0.00386290552,0.00790296283,0.013959864,0.00837781643,-0.00524027235,-0.0158415386,-0.013704186,0.000914425627,0.0167405873,0.0198772964,0.00559761815,-0.0161492402,-0.0271234522,-0.0153659305,0.0131726637,0.0362618849,0.0312154049,-0.0055652663,-0.0503789399,-0.0637602398,-0.0162502462,0.0884466598,0.209778037,0.290764233,0.290764233,0.209778037,0.0884466598,-0.0162502462,-0.0637602398,-0.0503789399,-0.0055652663,0.0312154049,0.0362618849,0.0131726637,-0.0153659305,-0.0271234522,-0.0161492402,0.00559761815,0.0198772964,0.0167405873,0.000914425627,-0.013704186,-0.0158415386,-0.00524027235,0.00837781643,0.013959864,0.00790296283,-0.00386290552,-0.0114613327,-0.00923091568,0.000179740322,0.00864431517,0.00948233399,0.00265173991,-0.00576176238,-0.00889158112,-0.00463694558,0.00302483882,0.00768391283,0.00581652723,-0.000600584332,-0.00607605131,-0.00626741483,-0.00139115414,0.00427046011,0.00609813465,0.0028791113,-0.00244745458,-0.00544043235,-0.00383927574,0.000757587079,0.00443881131,0.00429060879,0.000684194667,-0.00323938485,-0.00428809769,-0.00180175714,0.00197926022,0.00391378054,0.00255799998,-0.000777458991,-0.00326659165,-0.00295213872,-0.000271881056,0.00245196246,0.00301443897,0.00110357317,-0.00157208738,-0.00279903645,-0.00168257606,0.000717642614,0.00237562998,0.00200246734,384493874e-13,-0.00182088957,-0.00208160065,-0.000644859068,0.00121038371,0.00195754148,0.0010732018,-0.000611711544,-0.00168049112,-0.00131706068,793456875e-13,0.00130643989,0.00138905036,0.000348525498,-0.000890743918,-0.00131644851,-0.000651095587,0.000482705267,0.00113600937,0.000824131005,-0.000121570886,-0.000888589942,-0.0008775865,-0.000165826429,0.00061416739,0.000832102312,0.000365758872,-0.000347718209,-0.000714904767,-0.000476780129,0.000116282009,0.000555633678,0.00050768613,626346183e-13,-0.000382564326]
    };
    var lowpass = lowpass_70[(_reference.sampleRate).toString()];
    if (lowpass === null) {
      this.errorHandler.sendError("Sample size" + _reference.sampleRate + " is not supported for creating anchors.");
      return null;
    }  
    anchor70.setAudioBuffer(this.convolve(_reference, lowpass));
    return anchor70;
  };
  
  DCRP808AudioControl.prototype.convolve = function (_src, _coefficients) {
    var buffer = this.audioContext.createBuffer(_src.numberOfChannels, _src.length, _src.sampleRate);
    
    for (var i = 0; i < _src.numberOfChannels; ++i) {
      var s1 = _src.getChannelData(i);
      var dst = new Float32Array(_src.length + _coefficients.length - 1);
      // filter
      for (var n = 0; n < _src.length + _coefficients.length - 1; ++n) {
        dst[n] = 0.0;  
        var kmin = (n >= _coefficients.length - 1) ? n - (_coefficients.length - 1) : 0;
        var kmax = (n < _src.length - 1) ? n : _src.length - 1;  
        for (var k = kmin; k <= kmax; ++k)
        {
          dst[n] += s1[k] * _coefficients[n - k];
        }     
      }
      // copy
      var channelData = buffer.getChannelData(i);
      var offset = _coefficients.length - 1;
      for (var j = 0; j < buffer.length; ++j) {
        channelData[j] = dst[offset + j];
      }
    }
    
    
    return buffer;
  };
  
  DCRP808AudioControl.prototype.removeEventListener = function(_index) {
    this.eventListeners[_index] = null;  
  };
  
  
  DCRP808AudioControl.prototype.addEventListener = function(_listenerFunction) {
    this.eventListeners[this.eventListeners.length] = _listenerFunction;
    return this.eventListeners.length-1;
  };
  
  DCRP808AudioControl.prototype.sendEvent = function(_event) {
    for (var i = 0; i < this.eventListeners.length; ++i) {
        if (this.eventListeners[i] === null) {
            continue;
        }
      this.eventListeners[i](_event);
    }
  };
  
  DCRP808AudioControl.prototype.getPosition = function() {
    return this.audioCurrentPosition;
  };
  
  DCRP808AudioControl.prototype.getDuration = function() {
    return this.audioMaxPosition;
  };
  
  DCRP808AudioControl.prototype.initAudio = function() {
    this.dummyBufferSource = this.audioContext.createBufferSource(); // nothing to do
    this.dummyBufferSource.loop = true;
    this.dummyBufferSource.buffer = this.audioContext.createBuffer(1, this.bufferSize, this.audioContext.sampleRate);
  
    var channelCount = (this.reference.getAudioBuffer().numberOfChannels > 2) ?  this.audioContext.destination.channelCount : this.reference.getAudioBuffer().numberOfChannels;   
    this.scriptNode = this.audioContext.createScriptProcessor(this.bufferSize, 1, channelCount);
    this.scriptNode.onaudioprocess = (function(audioProcessingEvent) { this.process(audioProcessingEvent); }).bind(this);
    
    this.dummyBufferSource.connect(this.scriptNode);
    this.scriptNode.connect(this.audioContext.destination);
    this.dummyBufferSource.start();
  };
  
  DCRP808AudioControl.prototype.freeAudio = function() {
    this.stop();
  
    this.dummyBufferSource.disconnect(); // TODO mschoeff hard stop
    this.scriptNode.disconnect();
  
    this.scriptNode.onaudioprocess = null;
    this.dummyBufferSource = null; // nothing to do
    this.scriptNode = null;
  };


  DCRP808AudioControl.prototype.clearOutputBuffer = function() {
    if (this.scriptNode) {
      this.scriptNode.onaudioprocess = (function(audioProcessingEvent) {
        var outputBuffer = audioProcessingEvent.outputBuffer;
        for (var channel = 0; channel < outputBuffer.numberOfChannels; ++channel) {
          var outputData = outputBuffer.getChannelData(channel);
          for (var sample = 0; sample < outputBuffer.length; ++sample) {
            outputData[sample] = 0;
          }
        }
      }).bind(this);
    }
  };
  DCRP808AudioControl.prototype.setLoopingActive = function(_loopingActive) {
    this.audioLoopingActive = _loopingActive;
  };
  
  DCRP808AudioControl.prototype.isLoopingActive = function() {
    return this.audioLoopingActive;
  };
  
  
  DCRP808AudioControl.prototype.process = function(audioProcessingEvent) {
  
    var outputBuffer = audioProcessingEvent.outputBuffer;
    var inputBuffer = audioProcessingEvent.inputBuffer;
    
    var stimulus = this.audioStimulus;
    var sample;
    var ramp;
    var outputData;
    var channel;
    
    if (stimulus === null || this.audioPlaying === false) {
      // set to zero
      for (channel = 0; channel < outputBuffer.numberOfChannels; ++channel) {
        outputData = outputBuffer.getChannelData(channel);
        for (sample = 0; sample < outputBuffer.length; ++sample) {  
          outputData[sample] = 0;         
        }   
      }
      return;
    }
    
    var audioBuffer = stimulus.getAudioBuffer();
    
    if (this.audioCurrentPosition < this.audioLoopStart) {
      this.audioCurrentPosition = this.audioLoopStart;
    }
    
  
    if (this.audioCurrentPositionRequest !== null) {
      this.audioCurrentPosition = this.audioCurrentPositionRequest;
      this.audioCurrentPositionRequest = null;
    } 
    if (this.audioFadingActiveRequest !== null) {
      this.audioFadingActive = this.audioFadingActiveRequest;
      this.audioFadingActiveRequest = null;
    }
    var currentPosition = null; 
    var fadingCurrentPosition = null;
    var fadingActive = null;
    var loopingActive = this.audioLoopingActive;
    emptyBuffer = false;
    for (channel = 0; channel < this.reference.getAudioBuffer().numberOfChannels; ++channel) {
      outputData = outputBuffer.getChannelData(channel);
      inputData = audioBuffer.getChannelData(channel);
      currentPosition = this.audioCurrentPosition; 
      fadingCurrentPosition = this.audioFadingCurrentPosition;      
      fadingActive = this.audioFadingActive;
      
      var a =[];
      var b = [];
      for (sample = 0; sample < outputBuffer.length; ++sample) {
        
        if (loopingActive && (currentPosition == (this.audioLoopEnd - this.audioFadingMaxPosition))) { // loop almost at end => fading is triggered
          fadingActive = 1;
          this.audioFadingIn = this.audioStimulus;
          fadingCurrentPosition = 0;        
        }
        
        if (fadingActive == 1) { // fade out
          ramp = 0.5 * (1 + Math.cos(Math.PI*(fadingCurrentPosition++)/(this.audioFadingMaxPosition-1)));
          outputData[sample] = inputData[currentPosition++] * ramp;
          if (fadingCurrentPosition >= this.audioFadingMaxPosition) {          
            fadingActive = 2;
            fadingCurrentPosition = 0;
            if (this.audioFadingIn === null) {
              this.audioPlaying = false;
              fadingCurrentPosition = 0;
              fadingActive = 0;
              for (; sample < outputBuffer.length; ++sample) {
                outputData[sample] = 0;
              }
              break;
            } else {
              stimulus = this.audioStimulus = this.audioFadingIn;
              inputData = stimulus.getAudioBuffer().getChannelData(channel);
            }
            
          }
        } else if (fadingActive == 2) { // fade in
          ramp = 0.5 * (1 - Math.cos(Math.PI*(fadingCurrentPosition++)/(this.audioFadingMaxPosition-1)));
          outputData[sample] = inputData[currentPosition++] * ramp;
          if (fadingCurrentPosition >= this.audioFadingMaxPosition) {
            fadingCurrentPosition = 0;
            fadingActive = 0;
          }
        } else {
          outputData[sample] = inputData[currentPosition++];      
        }
        if (emptyBuffer === true) {
          for (; sample < outputBuffer.length; ++sample) {
            outputData[sample] = 0;
          }
          break;
        }
        if (currentPosition >= this.audioLoopEnd) {
          currentPosition = this.audioLoopStart;
          if (loopingActive === false) {
            refPlayed=true
            this.surpressLoop();
            this.audioPlaying = true;
            fadingActive = 1;
            emptyBuffer = true;
       }
        }
      }   
    }
    
    // volume
    
    for (channel = 0; channel < outputBuffer.numberOfChannels; ++channel) {
      outputData = outputBuffer.getChannelData(channel);
      for (sample = 0; sample < outputBuffer.length; ++sample) {  
        outputData[sample] = outputData[sample] * this.audioContext.volume;         
      }   
    }  
    
    
    // volume
    
    this.audioCurrentPosition = currentPosition;  
    this.audioFadingCurrentPosition = fadingCurrentPosition;
    this.audioFadingActive = fadingActive;
    
    var event = {
        name: 'processUpdate',
        currentSample:  this.audioCurrentPosition,
        sampleRate: this.audioSampleRate
    };  
    this.sendEvent(event);
    
  };
  
  DCRP808AudioControl.prototype.setLoopStart = function(_start) {
    if (_start >= 0 && _start < this.audioLoopEnd && (this.audioLoopEnd-_start) >= this.audioMinimumLoopDuration) {
      this.audioLoopStart = _start;
      if (this.audioCurrentPosition < this.audioLoopStart) {
        this.audioCurrentPositionRequest = this.audioLoopStart;
      }    
      var event = {
        name: 'loopStartChanged',      
        start : this.audioLoopStart,
        end : this.audioLoopEnd
      };  
      this.sendEvent(event);
    } 
  };
  
  DCRP808AudioControl.prototype.setLoopEnd = function(_end) {
    if (_end <= this.audioMaxPosition && _end > this.audioLoopStart && (_end-this.audioLoopStart) >= this.audioMinimumLoopDuration) {
      this.audioLoopEnd = _end;    
      if (this.audioCurrentPosition > this.audioLoopEnd) {
        this.audioCurrentPositionRequest = this.audioLoopEnd;
      }    
      var event = {
        name: 'loopEndChanged',
        start : this.audioLoopStart,
        end : this.audioLoopEnd     
      };  
      this.sendEvent(event);
    }
  };
  
  DCRP808AudioControl.prototype.setLoop = function(_start, _end) {
    var changed = false;
    if (_start >= 0 && _start < this.audioLoopEnd && (_end-_start) >= this.audioMinimumLoopDuration
      && _start != this.audioLoopStart) {
      this.audioLoopStart = _start;
      if (this.audioCurrentPosition < this.audioLoopStart) {
        this.audioCurrentPositionRequest = this.audioLoopStart;
      }   
      changed = true; 
    }  
    if (_end <= this.audioMaxPosition && _end > this.audioLoopStart && (_end-_start) >= this.audioMinimumLoopDuration
      && _end != this.audioLoopEnd) {
      this.audioLoopEnd = _end;    
      if (this.audioCurrentPosition > this.audioLoopEnd) {
        this.audioCurrentPositionRequest = this.audioLoopEnd;
      }    
      changed = true;
    }
  
    if (changed == true) {
      var event = {
        name: 'loopChanged',
        start : this.audioLoopStart,
        end : this.audioLoopEnd    
      };  
      this.sendEvent(event);
    }	    
  };
  
  
  DCRP808AudioControl.prototype.setPosition = function(_position, _setStartEnd) {
    this.audioCurrentPositionRequest = _position;
    if(_setStartEnd){
        if (_position < this.audioLoopStart || _position <= parseInt((this.audioLoopEnd + this.audioLoopStart)/2)) {
          this.setLoopStart(_position);
        }else if (_position > this.audioLoopEnd || _position > parseInt((this.audioLoopEnd + this.audioLoopStart)/2)) {
          this.setLoopEnd(_position);
        }
    }
    var eventUpdate = {
      name: 'processUpdate',
      currentSample:  this.audioCurrentPositionRequest,
      sampleRate: this.audioSampleRate
    };  
    this.sendEvent(eventUpdate);  
  };
  
  DCRP808AudioControl.prototype.getNumSamples = function() {
    return this.audioMaxPosition;
  };
  
  
  
  DCRP808AudioControl.prototype.play = function(_stimulus, _isReference) {
    if (_stimulus === null) {
      _stimulus = this.audioStimulus;
    }
  
    if ((this.audioStimulus !== _stimulus || _isReference !== this.audioIsReferencePlaying) 	&& this.audioStimulus !== null && this.audioPlaying !== false) {
      this.fadeOut(_stimulus);
    } else {
      this.audioStimulus = _stimulus;
      if (this.audioPlaying === false) {      
        this.fadeIn(_stimulus);
      }          
    }    
    this.audioPlaying = true;  
  };
  
  DCRP808AudioControl.prototype.getActiveStimulus = function() {
    return this.audioStimulus;
  };
  
  DCRP808AudioControl.prototype.playReference = function() {
    this.refPlayed=false;
    this.play(this.reference, true);
    if (this.switchBack) {
      this.setPosition(0, false);
    };
    this.audioIsReferencePlaying = true;
  
    
    var event = {
        name: 'playReferenceTriggered',
        conditionLength : this.conditions.length
    };  
    this.sendEvent(event);
  
    return;
  };
  
  DCRP808AudioControl.prototype.playCondition = function(_index) {
    this.play(this.conditions[_index], false);
    if (this.switchBack) {
      this.setPosition(0, false);
    };
    this.audioIsReferencePlaying = false;
    var event = {
        name: 'playConditionTriggered',
        index : _index,
        length : this.conditions.length
    };  
    this.sendEvent(event);
  
    return;
  };
  
  
  DCRP808AudioControl.prototype.fadeOut = function(_stimulusFadeIn) {
    this.audioFadingIn = _stimulusFadeIn;
    this.audioFadingCurrentPositionRequest = 0;
    this.audioFadingActiveRequest = 1;
  };
  
  DCRP808AudioControl.prototype.fadeIn = function(_stimulusFadeIn) {
    this.audioFadingIn = _stimulusFadeIn;
    this.audioFadingCurrentPositionRequest = 0;
    this.audioFadingActiveRequest = 2;
  };
  
  
  
  DCRP808AudioControl.prototype.pause = function() {
    if (this.audioPlaying === true) {
      this.fadeOut(null);
    }
    var event = {
      name: 'pauseTriggered',
      conditionLength : this.conditions.length
    };  
    this.sendEvent(event);
    return;
  };
  
  
  DCRP808AudioControl.prototype.surpressLoop = function() {
    this.pause();
  
    this.audioCurrentPositionRequest = this.audioLoopStart;
    var eventUpdate = {
      name: 'processUpdate',
      currentSample:  this.audioCurrentPositionRequest,
      sampleRate: this.audioSampleRate
    };  
    this.sendEvent(eventUpdate);
  
    var event = {
      name: 'surpressLoop'
    };  
    this.sendEvent(event);
  
    return;
  };
  
  
  DCRP808AudioControl.prototype.stop = function() {
    this.audioCurrentPositionRequest = this.audioLoopStart;
    if (this.audioPlaying === true) {
      this.fadeOut(null);
    }
    var event = {
      name: 'stopTriggered',
      conditionLength : this.conditions.length
    };  
    this.sendEvent(event);
    
    var eventUpdate = {
      name: 'processUpdate',
      currentSample:  this.audioCurrentPositionRequest,
      sampleRate: this.audioSampleRate
    };  
    this.sendEvent(eventUpdate);
    
    return;
  };
  
  
  DCRP808AudioControl.prototype.getConditions = function() {
    return this.conditions;
  };
  
  DCRP808AudioControl.prototype.getReferenceIndexOfConditions = function() {
    for (var i = 0; i < this.conditions.length; ++i) {
      if (this.conditions[i] === this.reference) {
        return i;
      }
      return null;
    }
  };