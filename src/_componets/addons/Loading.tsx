import Overlay from '@/_componets/addons/Overlay';
import FuzzyText from '@/TextAnimations/FuzzyText/FuzzyText';

export default function Loading() {
  return (
    <div>
      <Overlay brightness={0.9}>
        {/* Wrap text so long strings break and center nicely */}
        <p className="w-full max-w-md break-words text-center leading-snug text-2xl sm:text-3xl flex items-center justify-center text-center">
          <FuzzyText baseIntensity={0.2} enableHover={true} fontSize={40}>
            Hang&nbsp;Tight — We&rsquo;re&nbsp;customizing&nbsp;your&nbsp;dashboard
          </FuzzyText>
        </p>
      </Overlay>
    </div>
  );
}
