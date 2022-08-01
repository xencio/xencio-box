import { TransformationType } from 'class-transformer';
import { format, parse } from 'date-fns';

const TIME_FORMATTER = 'yyyy-MM-dd HH:mm:ss';

export function transformTime(value, transType: TransformationType) {
  try {
    if (transType === TransformationType.PLAIN_TO_CLASS) {
      return value instanceof Date
        ? value
        : typeof value === 'number'
        ? parse(value.toString(), value < Math.pow(10, 8) ? 'yyyyMMdd' : 'T', new Date())
        : typeof value === 'string' && value.length === 8
        ? parse(value, 'yyyyMMdd', new Date())
        : value;
    } else if (transType === TransformationType.CLASS_TO_PLAIN) {
      return format(value, TIME_FORMATTER);
    }
    return value;
  } catch (error) {
    return value;
  }
}
