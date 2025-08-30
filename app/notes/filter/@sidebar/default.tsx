import Link from 'next/link';
import css from './default.module.css';
import { staticTags } from '@/lib/constants';

const NotesSidebar = async () => {
  const menuItems = ["All", "Todo", "Work", "Personal", "Meeting", "Shopping"];
  const tags = staticTags;

  return (
    <div className={css.menuContainer}>
      <Link href="/notes/action/create" className={css.menuButton}>Create note</Link>
    <ul className={css.menuList}>
      {menuItems.map((item) => (
        <li key={item} className={css.menuItem}>
          <Link href={`/notes/filter/${item}`}>{item}</Link>
        </li>
      ))}
    </ul>
    </div>
  );
};

export default NotesSidebar;