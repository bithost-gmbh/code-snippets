import { animate, AnimationTriggerMetadata, keyframes, style, transition, trigger } from '@angular/animations';


export const wobbleAnimation: AnimationTriggerMetadata = trigger('wobbleAnimation', [
  transition('* <=> *', animate(420, keyframes([
    style({transform: 'translate3d(12px, 0, 0) ', offset: .16}),
    style({transform: 'translate3d(-9px, 0, 0) ', offset: .31}),
    style({transform: 'translate3d(7px, 0, 0)', offset: .50}),
    style({transform: 'translate3d(-5px, 0, 0) ', offset: .70}),
    style({transform: 'translate3d(3px, 0, 0) ', offset: .90}),
    style({transform: 'none', offset: 1}),
  ]))),
]);
