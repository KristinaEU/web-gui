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
    SimpleGreet: {src: "animations_1.1.1.wbin", range: [0,1.88]},
    PersonalGreet: {src: "animations_1.1.1.wbin", range: [0,1.88]},
    SimpleSayGoodbye: {src: "animations_1.1.1.wbin", range: [0,1.88]},
    PersonalSayGoodbye: {src: "animations_1.1.1.wbin", range: [0,1.88]},
    MeetAgainSayGoodbye: {src: "animations_1.1.1.wbin", range: [0,1.88]},
    // Moods
    ShareJoy: {src: "animations_1.1.1.wbin", range: [0,0]},
    CheerUp: {src: "animations_1.1.1.wbin", range: [0,0]},
    CalmDown: {src: "animations_1.1.1.wbin", range: [0,0]},
    Console: {src: "animations_1.1.1.wbin", range: [0,0]},
    SimpleMotivate: {src: "animations_1.1.1.wbin", range: [0,0]},
    // Ask
    AskMood: {src: "animations_1.1.1.wbin", range: [0,0]},
    AskTask: {src: "animations_1.1.1.wbin", range: [0,0]},
    // Please repeat
    RequestRephrase: {src: "animations_1.1.1.wbin", range: [1.88,4.58]},
    RequestRepeat: {src: "animations_1.1.1.wbin", range: [1.88,4.58]},
    StateMissingComprehension: {src: "animations_1.1.1.wbin", range: [4.58,6.03]},
    // Thanks
    AnswerThank: {src: "animations_1.1.1.wbin", range: [1.88,4.58]},
    // Apologise
    SimpleApologise: {src: "animations_1.1.1.wbin", range: [4.58,6.03]},
    PersonalApologise: {src: "animations_1.1.1.wbin", range: [4.58,6.03]},
    // Statement
    Accept: {src: "animations_1.1.1.wbin", range: [0,0]},
    Acknowledge: {src: "animations_1.1.1.wbin", range: [0,0]},
    Reject: {src: "animations_1.1.1.wbin", range: [0,0]}
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