'use strict';
// Read-only host for the same animation modules used on the home screen.
// Reward changes in this isolated example cannot write the app's saved state.
const previewGender=new URLSearchParams(location.search).get('gender')==='female'?'female':'male';
const page='journey-preview';
const data={};
function travelerFemale(){return previewGender==='female'}
function travelerState(){return {background:'forest',motion:'walk'}}
function travelerVisualNight(){return false}
function travelerArt(){return ''}
function travelerBundleCard(){return ''}
function travelerPanorama(){return ''}
function changeTravelerReward(){return false}

// Catalog previews remain available before unlocking; no equipment is changed.
function motionBroomUnlocked(){return true}

function motionActivityCounts(){return {total:5}}
function motionQuestTarget(){return 0}
