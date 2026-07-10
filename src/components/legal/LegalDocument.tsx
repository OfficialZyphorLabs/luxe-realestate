/**
 * LegalDocument — shared layout for the static trust/legal pages (Terms,
 * Privacy, Fair Housing). Presentational; renders under the marketing chrome.
 *
 * NOTE: the copy in these pages is a professional starting template, not
 * attorney-reviewed language. Have counsel review before relying on it.
 */
export interface LegalSection {
  heading: string
  body: string[]
}

interface LegalDocumentProps {
  title: string
  intro: string
  updated: string
  sections: LegalSection[]
}

export function LegalDocument({ title, intro, updated, sections }: LegalDocumentProps) {
  return (
    <div className="pt-20">
      <section className="page-container py-stack-lg">
        <div className="mx-auto max-w-3xl">
          <p className="font-body text-label-md uppercase tracking-widest text-on-primary-container">
            Legal
          </p>
          <h1 className="mt-2 font-display text-display-lg font-bold leading-tight text-primary">
            {title}
          </h1>
          <p className="mt-4 font-body text-body-lg text-secondary">{intro}</p>
          <p className="mt-2 font-body text-caption uppercase tracking-widest text-secondary">
            Last updated {updated}
          </p>

          <div className="mt-10 flex flex-col gap-8">
            {sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-display text-headline-md font-semibold text-primary">
                  {section.heading}
                </h2>
                {section.body.map((paragraph, i) => (
                  <p key={i} className="mt-3 font-body text-body-md leading-relaxed text-on-surface-variant">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <p className="mt-12 rounded-xl bg-surface-container-low p-4 font-body text-caption text-secondary">
            This document is a general template provided for convenience and does not constitute legal
            advice. Consult qualified counsel before relying on it.
          </p>
        </div>
      </section>
    </div>
  )
}
