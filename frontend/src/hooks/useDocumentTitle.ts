import { useEffect } from 'react'

const SUFFIX = 'GEEKSTOBER'

/** Sets `document.title` per route: "Projects — GEEKSTOBER". */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} — ${SUFFIX}` : `${SUFFIX} — Code. Contribute. Compete.`
  }, [title])
}
