import { useEventContext } from '../contexts/EventContext';

export function useEvents() {
  return useEventContext();
}
