import { isRNCDatePickerAvailable } from './nativeDatePicker';
import { WallClockTimePickerWheel } from './WallClockTimePickerWheel';

type Props = {
  visible: boolean;
  title: string;
  value: string;
  onChange: (time: string) => void;
  onClose: () => void;
};

export function WallClockTimePickerModal(props: Props) {
  if (isRNCDatePickerAvailable()) {
    const { WallClockTimePickerNative } =
      require('./WallClockTimePickerNative') as typeof import('./WallClockTimePickerNative');
    return <WallClockTimePickerNative {...props} />;
  }
  return <WallClockTimePickerWheel {...props} />;
}
