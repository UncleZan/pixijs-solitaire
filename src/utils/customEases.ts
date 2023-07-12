import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

export const customBackOut = CustomEase.create(
    'customBackOut',
    'M0,0 C0.126,0.382 0.358,0.754 0.516,0.902 0.708,1.082 0.818,1.001 1,1 ',
);
