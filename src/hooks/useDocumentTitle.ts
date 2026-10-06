import { useEffect } from 'react'

const SUFFIX = 'GEEKTOBER'

/** Sets `document.title` per route: "Projects — GEEKTOBER". */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} — ${SUFFIX}` : `${SUFFIX} — Code. Contribute. Compete.`
  }, [title])
}
