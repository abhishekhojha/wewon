import React from 'react'

export default function Sections({ children }: React.PropsWithChildren) {
  return (
    <section className="py-10 sm:py-16 md:py-24 px-4 mt-2 md:mt-4">
      {children}
    </section>
  );
}
