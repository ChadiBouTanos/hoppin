import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '../constants/support';

export function SupportFooterBanner() {
  return (
    <div className="support-banner mx-auto max-w-6xl px-6 sm:px-6 lg:px-8">
      <div className="support-banner-card flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Hai bisogno di aiuto?</p>
          <p className="text-sm text-gray-600">Scrivici e ti rispondiamo il prima possibile.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={SUPPORT_WHATSAPP}
            className="support-whatsapp inline-flex items-center justify-center rounded-full border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            Chat su WhatsApp
          </a>
          <a
            href={SUPPORT_EMAIL}
            className="btn-primary px-4 py-2 text-sm"
          >
            Scrivici via email
          </a>
        </div>
      </div>
    </div>
  );
}
