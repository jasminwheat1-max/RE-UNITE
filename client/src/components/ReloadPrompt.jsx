import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="reload-toast">
      <span>A new version is available.</span>
      <button onClick={() => updateServiceWorker(true)}>Refresh</button>
    </div>
  );
}
