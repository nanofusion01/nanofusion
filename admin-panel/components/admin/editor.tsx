'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Heading1, 
  Heading2, 
  Link as LinkIcon, 
  Image as ImageIcon 
} from 'lucide-react'

interface EditorProps {
  content: string
  onChange: (content: string) => void
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  const addImage = () => {
    const url = window.prompt('URL obrázku:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const url = window.prompt('URL odkazu:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-slate-50 rounded-t-xl" style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-lg hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-amber-600' : ''}`}
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-lg hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-amber-600' : ''}`}
      >
        <Italic size={18} />
      </button>
      <div className="w-px h-6 bg-slate-300 my-auto mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded-lg hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-amber-600' : ''}`}
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-lg hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-amber-600' : ''}`}
      >
        <Heading2 size={18} />
      </button>
      <div className="w-px h-6 bg-slate-300 my-auto mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-lg hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 text-amber-600' : ''}`}
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-lg hover:bg-slate-200 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200 text-amber-600' : ''}`}
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded-lg hover:bg-slate-200 transition-colors ${editor.isActive('blockquote') ? 'bg-slate-200 text-amber-600' : ''}`}
      >
        <Quote size={18} />
      </button>
      <div className="w-px h-6 bg-slate-300 my-auto mx-1" />
      <button onClick={setLink} className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
        <LinkIcon size={18} />
      </button>
      <button onClick={addImage} className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
        <ImageIcon size={18} />
      </button>
      <div className="w-px h-6 bg-slate-300 my-auto mx-1" />
      <button onClick={() => editor.chain().focus().undo().run()} className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
        <Undo size={18} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
        <Redo size={18} />
      </button>
    </div>
  )
}

export function TiptapEditor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-6 text-slate-800'
      }
    }
  })

  return (
    <div className="border rounded-xl flex flex-col overflow-hidden transition-all focus-within:ring-2 focus-within:ring-amber-500/10 focus-within:border-amber-500/50" style={{ borderColor: 'var(--border)' }}>
      <MenuBar editor={editor} />
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
