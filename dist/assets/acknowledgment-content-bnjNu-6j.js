(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function a(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(e){if(e.ep)return;e.ep=!0;const o=a(e);fetch(e.href,o)}})();const s="Acknowledgment of Country and Lineage";function h(n){const t=n?.querySelector?.(".ack-figure img"),a=n?.querySelector?.(".ack-figure");if(!(!t||!a)){if(t.complete&&t.naturalWidth===0){a.remove();return}t.addEventListener("error",()=>a.remove(),{once:!0})}}function l({titleId:n="ackTitle",headingLevel:t="h2"}={}){return`
    <${t} id="${n}" class="ack-title">${s}</${t}>

    <figure class="ack-figure">
      <img
        src="/images/bogangar-stone.jpg"
        alt="Stone at Bogangar inscribed with acknowledgment of the Goodjingburra clan of the Bundjalung people."
        loading="lazy"
        decoding="async">
    </figure>

    <blockquote class="ack-quote">
      <p>You are standing in the land of the Goodjingburra clan of the Bundjalung people. The descendants of these people remain spiritually connected to this place &mdash; always.</p>
    </blockquote>

    <p class="ack-bridge"><em>I walk past this stone with the ebb and flood of the tide.</em></p>

    <hr class="ack-rule" aria-hidden="true">

    <div class="ack-body">
      <p>As an elder, I have enjoyed many long southern summers in <a href="https://onthehillgilayjun.blogspot.com/p/bunda.html" target="_blank" rel="noopener noreferrer">Bundjalung</a> country, and since 2020 I have lived near the placement of this commemorating stone for six months of most years. The rock was here before the thinking gathered in these pages. So was the tide. So was the Country.</p>

      <p>The Goodjingburra are a clan of the Minjungbal people, within the wider Bundjalung Nation of the east coast of northern New South Wales. I pay my respects to the Traditional Custodians of this place, to their Elders past and present, and to those now emerging into leadership.</p>

      <p><a href="https://commonslibrary.org/all-about-dr-mary-graham/" target="_blank" rel="noopener noreferrer">Aunty Dr Mary Graham AM</a>, a Kombu-merri philosopher of the Gold Coast just north of here, has written that the foundational axioms of the Aboriginal worldview are two: the <strong>Land is the Law</strong>, and <strong>You Are Not Alone in the World</strong>. The first says that meaning does not begin in the human mind and reach outward to a silent backdrop; meaning begins in the ground, and the human task is to listen. The second says that identity is not the possession of a discrete self but a location within a web of relationship that precedes us and continues after us. From these two axioms a great deal follows &mdash; the custodial ethic that is grown rather than made, the reflective motive practised together rather than alone, the refusal of any single claim to be the one true way.</p>

      <p>I do not claim these axioms as my own inheritance. I recognise them as the law of the ground on which this work has been thought.</p>

      <p>The Buddhist tradition in which my own practice is rooted &mdash; the <a href="https://www.namchak.org/community/blog/four-schools-of-tibetan-buddhism/" target="_blank" rel="noopener noreferrer">Nyingma lineage of Tibetan Buddhism</a> &mdash; holds, through the teaching of <em>pratityasamutpada</em>, that nothing arises independently; every phenomenon comes into being through the meeting of conditions, and passes as those conditions pass. Aunty Dr Mary Graham AM names a careful difference between these two traditions: where Buddhism seeks release from the wheel of birth and suffering, Aboriginal Law, being located in the land itself, celebrates life in its ups and downs, and uses the downs to point to moral formulae. The two traditions are not the same. They meet here, on this coast, without fusing &mdash; each holding the other more fully into its own truth.</p>

      <p>I offer this work in recognition that the ground beneath me is not inert. It is ancestor, teacher, and living presence. It has shaped the thinking in ways I am only beginning to understand. What is useful in these pages was, in large part, grown here &mdash; in the rhythm of the tide, in the quiet intelligence of rivers and coastal plain, in the presence of a people whose spiritual connection to this place does not depend on my recognition of it.</p>

      <p>The gift of this Country precedes this work. What is offered here is returned, in reciprocity and gratitude, into the web of life from which it came.</p>
    </div>

    <p class="ack-signature">Bob Beth &mdash; Bogangar, Bundjalung country</p>

    <figure class="ack-closing-figure">
      <picture>
        <source srcset="/images/Bob-overlooking-Bogangar.avif" type="image/avif">
        <source srcset="/images/Bob-overlooking-Bogangar.webp" type="image/webp">
        <img
          src="/images/Bob-overlooking-Bogangar.jpg"
          alt="Bob Beth at Bogangar headland, Bundjalung Country."
          width="4032"
          height="3024"
          loading="lazy"
          decoding="async">
      </picture>
      <figcaption>Bob Beth at Bogangar headland, Bundjalung Country.</figcaption>
    </figure>
  `}export{l as a,h as w};
