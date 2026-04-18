import './style.css';
import { acknowledgmentHTML, wireAcknowledgmentImage } from './acknowledgment-content.js';

const mount = document.getElementById('ackContent');
if (mount) {
  mount.innerHTML = acknowledgmentHTML({ titleId: 'ackTitle', headingLevel: 'h1' });
  wireAcknowledgmentImage(mount);
}
