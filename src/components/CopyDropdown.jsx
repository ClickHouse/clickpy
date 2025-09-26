'use client';

import { useState, useEffect, useRef } from 'react';
import { LinkIcon } from '@heroicons/react/20/solid';

/**
 * Reusable dropdown component that offers copy utilities for a given link.
 *
 * Props:
 *   link: string (required) – the URL to copy or embed.
 *   className: string – optional additional Tailwind classes for the container.
 */
export default function CopyDropdown({ link, className = '' }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close the menu when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  let finalLink = link;

  const iframeCode = `<iframe src="${finalLink}" frameborder="0" width="100%" height="600"></iframe>`;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Clipboard copy failed', err);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type='button'
        onClick={() => setOpen((prev) => !prev)}
        className='w-5 ml-5 hover:text-yellow-300 focus:outline-none'
        aria-label='Share options'>
        <LinkIcon className='h-5 w-5 flex-none icon-hover' aria-hidden='true' />
      </button>

      {open && (
        <div className='absolute z-10 w-44 origin-top-right rounded-md bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5'>
          <div>
            <button
              type='button'
              onClick={() => {
                copyToClipboard(finalLink);
                setOpen(false);
              }}
              className='block w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700'>
              Copy link
            </button>
            <button
              type='button'
              onClick={() => {
                copyToClipboard(iframeCode);
                setOpen(false);
              }}
              className='block w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700'>
              Copy iframe code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
