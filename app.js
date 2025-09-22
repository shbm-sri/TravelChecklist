// Simple Travel Checklist App
(function(){
  const DEFAULT = {
    "Clothes": ["T-shirts","Underwear","Socks","Sleepwear"],
    "Accessories": ["Sunglasses","Hat","Watch"],
    "Skincare": ["Sunscreen","Moisturizer"],
    "Documents": ["Passport","ID","Insurance"],
    "Tickets": ["Flight ticket","Hotel booking"],
    "Car related": ["Insurance","Registration","Charger"],
    "Hiking": ["Boots","Backpack","Water bottle"],
    "Air Travel": ["Neck pillow","Noise-cancelling headphones"],
    "International Travel": ["Adapter","Copies of passport"]
  };

  const FILE_NAME = 'travel-checklist.json';

  const dom = {
    categories: document.getElementById('categories'),
    categoryTpl: document.getElementById('categoryTpl'),
    itemTpl: document.getElementById('itemTpl'),
    saveBtn: document.getElementById('saveBtn'),
    loadBtn: document.getElementById('loadBtn'),
    addCatBtn: document.getElementById('addCatBtn'),
    banner: document.getElementById('banner')
  };

  let data = {};
  let fileHandle = null; // optional File System Access handle

  // --- utils ---
  function showBanner(message, ok=true){
    dom.banner.textContent = message;
    dom.banner.className = 'banner ' + (ok? 'success':'fail');
    dom.banner.classList.remove('hidden');
    setTimeout(()=> dom.banner.classList.add('hidden'), 3000);
  }

  function deepClone(obj){ return JSON.parse(JSON.stringify(obj)); }

  // --- persistence ---
  async function saveToFile(){
    const json = JSON.stringify(data, null, 2);

    // always persist to localStorage as an in-browser backup
    try{ localStorage.setItem('travel-checklist:json', json); }catch(e){ /* ignore */ }

    // try File System Access API (reuse existing handle if possible)
    if(window.showSaveFilePicker || fileHandle){
      try{
        let handle = fileHandle;
        if(!handle){
          handle = await window.showSaveFilePicker({
            suggestedName: FILE_NAME,
            types:[{description:'JSON',accept:{'application/json':['.json']}}]
          });
        }
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        fileHandle = handle;
        showBanner('Saved checklist to "' + (handle.name||FILE_NAME) + '"');
        return;
      }catch(err){
        console.warn('Save via FS API failed',err);
      }
    }

    // fallback: create blob and download
    const blob = new Blob([json],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = FILE_NAME; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showBanner('Downloaded ' + FILE_NAME);
  }

  async function loadFromFile(){
    // try File System Access API open
    if(window.showOpenFilePicker){
      try{
        const [h] = await window.showOpenFilePicker({types:[{description:'JSON',accept:{'application/json':['.json']}}],multiple:false});
        const file = await h.getFile();
        const text = await file.text();
        data = JSON.parse(text);
        fileHandle = h;
        render();
        showBanner('Loaded ' + file.name);
        return;
      }catch(err){
        console.warn('Load via FS API failed',err);
      }
    }

    // fallback: file input
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json,application/json';
    input.onchange = async ()=>{
      const f = input.files[0];
      if(!f) return;
      const text = await f.text();
      try{
        data = JSON.parse(text);
        render();
        showBanner('Loaded ' + f.name);
      }catch(e){
        showBanner('Invalid JSON file', false);
      }
    };
    input.click();
  }

  // --- render ---
  function createCategory(name, items){
    const tpl = dom.categoryTpl.content.cloneNode(true);
    const section = tpl.querySelector('section');
    const title = section.querySelector('.category-title');
    const itemsList = section.querySelector('.items');
    const addBtn = section.querySelector('.add-item');
    const delCat = section.querySelector('.delete-category');

    title.textContent = name;
    title.dataset.orig = name;
    title.addEventListener('input', ()=> onCategoryRename(title));

    addBtn.addEventListener('click', ()=>{
      addItemToCategory(title.textContent || 'Untitled', '');
    });

    delCat.addEventListener('click', ()=>{
      if(confirm('Delete category "' + title.textContent + '"?')){
        delete data[title.textContent];
        render();
      }
    });

    (items||[]).forEach(it=> itemsList.appendChild(createItem(it, false)));

    return section;
  }

  function onCategoryRename(titleEl){
    // when a category title changes, update the data model to move items under the new name
    const oldName = titleEl.dataset.orig;
    const newName = titleEl.textContent.trim() || 'Untitled';
    if(oldName === newName) return;
    // avoid clobbering existing category: if newName exists, append
    const section = titleEl.closest('section');
    const items = Array.from(section.querySelectorAll('.item .item-text')).map(i=>i.value.trim()).filter(Boolean);
    // remove old key
    if(oldName && data.hasOwnProperty(oldName)) delete data[oldName];
    if(data[newName]){
      data[newName] = data[newName].concat(items);
    }else{
      data[newName] = items;
    }
    titleEl.dataset.orig = newName;
    render();
  }

  function createItem(text, checked){
    const tpl = dom.itemTpl.content.cloneNode(true);
    const li = tpl.querySelector('li');
    const chk = li.querySelector('.item-check');
    const input = li.querySelector('.item-text');
    const del = li.querySelector('.delete-item');

    chk.checked = !!checked;
    input.value = text || '';

    // keep model in sync on change
    input.addEventListener('input', ()=> syncFromUI());
    chk.addEventListener('change', ()=> syncFromUI());
    del.addEventListener('click', ()=>{ li.remove(); syncFromUI(); });

    return li;
  }

  function render(){
    dom.categories.innerHTML = '';
    for(const [cat, items] of Object.entries(data)){
      const section = createCategory(cat, items);
      dom.categories.appendChild(section);
    }
  }

  // read UI and sync to data model
  function syncFromUI(){
    const res = {};
    const cats = dom.categories.children;
    for(const section of cats){
      const title = section.querySelector('.category-title').textContent.trim() || 'Untitled';
      const items = [];
      const lis = section.querySelectorAll('.item');
      for(const li of lis){
        const txt = li.querySelector('.item-text').value.trim();
        if(txt) items.push(txt);
      }
      res[title] = items;
    }
    data = res;
  }

  function addItemToCategory(catName, text){
    // find category section by title
    for(const section of dom.categories.children){
      const title = section.querySelector('.category-title').textContent.trim();
      if(title === catName){
        const itemsList = section.querySelector('.items');
        const li = createItem(text, false);
        itemsList.appendChild(li);
        li.querySelector('.item-text').focus();
        syncFromUI();
        return;
      }
    }
    // not found -> create new category
    data[catName] = data[catName] || [];
    render();
    addItemToCategory(catName, text);
  }

  // --- UI wiring ---
  dom.saveBtn.addEventListener('click', async ()=>{
    syncFromUI();
    await saveToFile();
  });

  dom.loadBtn.addEventListener('click', async ()=>{
    await loadFromFile();
  });

  // Add category button
  if(dom.addCatBtn){
    dom.addCatBtn.addEventListener('click', ()=>{
      const name = prompt('New category name:');
      if(!name) return;
      const key = name.trim();
      if(!key) return;
      if(data[key]){
        alert('Category already exists');
        return;
      }
      data[key] = [];
      render();
    });
  }

  // initial load: try root JSON, then localStorage, then default
  async function init(){
    // 1) try to fetch from same folder: ./travel-checklist.json
    try{
      const resp = await fetch('./' + FILE_NAME, {cache: 'no-store'});
      if(resp.ok){
        const text = await resp.text();
        data = JSON.parse(text);
        render();
        console.log('Loaded checklist from root file');
        return;
      }
    }catch(e){ /* ignore */ }

    // 2) try localStorage
    const ls = localStorage.getItem('travel-checklist:json');
    if(ls){
      try{ data = JSON.parse(ls); render(); return; }catch(e){ console.warn('ls invalid',e); }
    }

    // 3) fallback default
    data = deepClone(DEFAULT);
    render();
  }

  // autosave to localStorage so user doesn't lose in-session edits
  setInterval(()=>{ try{ syncFromUI(); localStorage.setItem('travel-checklist:json', JSON.stringify(data)); }catch(e){} }, 2000);

  // expose a keyboard shortcut to add category
  window.addEventListener('keydown', (e)=>{
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='n'){
      const name = prompt('New category name:');
      if(name){ data[name]=[]; render(); }
    }
  });

  init();
})();
