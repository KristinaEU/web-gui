//@Animation control
// Globals
if (!LS.Globals)
  LS.Globals = {};

LS.Globals.Anim = this;


// Start
this.onStart = function(){
  
  this.defineDialogueActs();
  
  //this.anims = ["stand2walk_f.wbin", "walk_f.wbin", "walk2stand_f.wbin"];
	this.path = "hplass/projects/kristina/animations/";

	this.animComp = node.getComponents(LS.Components.PlayAnimation)[0];
  if (!this.animComp){
    console.log("Creating PlayAnimation Component");
    this.animComp = new LS.Components.PlayAnimation();
    node.addComponent(this.animComp);
  }
}


// Animation name as input
this.getEndAnim = function(){
  this.animComp.getDuration();
}

// Dialogue act as input
this.getEndDialogueAct = function(){
  
}

// Relates dialogue acts with specific animation clips
this.defineDialogueActs = function(){
  this.dialogueActs = {
    // Greetings
    SimpleGreet: {src: "packAnimations.wbin", range: [8.5,11]},
    PersonalGreet: {src: "animations_1.1.1.wbin", range: [11,17.4]},
    SimpleSayGoodbye: {src: "animations_1.1.1.wbin", range: [8.5,11]},
    PersonalSayGoodbye: {src: "animations_1.1.1.wbin", range: [11,17.4]},
    MeetAgainSayGoodbye: {src: "animations_1.1.1.wbin", range: [11,17.4]},
    // Moods
    ShareJoy: {src: "animations_1.1.1.wbin", range: [36,41.35]},
    CheerUp: {src: "animations_1.1.1.wbin", range: [36,41.35]},
    CalmDown: {src: "animations_1.1.1.wbin", range: [27,32]},
    Console: {src: "animations_1.1.1.wbin", range: [27,32]},
    SimpleMotivate: {src: "animations_1.1.1.wbin", range: [17.9,22]},
    // Ask
    AskMood: {src: "animations_1.1.1.wbin", range: [22,27]},
    AskTask: {src: "animations_1.1.1.wbin", range: [22,27]},
    // Please repeat
    RequestRephrase: {src: "animations_1.1.1.wbin", range: [22,27]},
    RequestRepeat: {src: "animations_1.1.1.wbin", range: [22,27]},
    StateMissingComprehension: {src: "animations_1.1.1.wbin", range: [22,27]},
    // Thanks
    AnswerThank: {src: "animations_1.1.1.wbin", range: [31.7,35.7]},
    // Apologise
    SimpleApologise: {src: "animations_1.1.1.wbin", range: [31.7,35.5]},
    PersonalApologise: {src: "animations_1.1.1.wbin", range: [31.7,35.5]},
    // Statement
    Accept: {src: "animations_1.1.1.wbin", range: [4.1,5.3]},
    Acknowledge: {src: "animations_1.1.1.wbin", range: [31.7,35.5]},
    Reject: {src: "animations_1.1.1.wbin", range: [5.6,8.2]}
  };
}


// --------------------- GESTURE ---------------------
// BML
// <gesture start ready strokeStart stroke strokeEnd relax end mode lexeme>
// mode [LEFT_HAND, RIGHT_HAND, BOTH_HANDS]
// lexeme [BEAT]
LS.Globals.gesture = function(gestData){

  var gestureInfo = LS.Globals.Anim.dialogueActs[gestData.lexeme];
  if (!gestureInfo){
    console.warn("Gesture lexeme not found:", gestData.lexeme);
    return;
  }
    
  var str = LS.Globals.Anim.path + gestureInfo.src;
  
  var animComp = LS.Globals.Anim.animComp;
  if (animComp){
    animComp.animation = str;
  	animComp.range = gestureInfo.range;
  	animComp.current_time = 0;
  	animComp.mode = LS.Components.PlayAnimation.ONCE;
  	animComp.play();
  }
  
  
}