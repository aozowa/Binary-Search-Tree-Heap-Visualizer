const $ = (id) => document.getElementById(id);
function makeBST(values) {
  let root = null;
  for (const v of values) {
    const n = { v, l: null, r: null };
    if (!root) {
      root = n;
      continue;
    }
    let cur = root;
    while (true) {
      if (v < cur.v) {
        if (!cur.l) {
          cur.l = n;
          break;
        }
        cur = cur.l;
      } else {
        if (!cur.r) {
          cur.r = n;
          break;
        }
        cur = cur.r;
      }
    }
  }
  return root;
}
function clone(t) {
  if (!t) return null;
  return { v: t.v, l: clone(t.l), r: clone(t.r) };
}
function nodes(root) {
  let a = [];
  function w(n) {
    if (!n) return;
    a.push(n);
    w(n.l);
    w(n.r);
  }
  w(root);
  return a;
}
function heapify(root, kind) {
  function sift(n) {
    if (!n) return;
    let best = n;
    if (n.l && (kind === "min" ? n.l.v < best.v : n.l.v > best.v)) best = n.l;
    if (n.r && (kind === "min" ? n.r.v < best.v : n.r.v > best.v)) best = n.r;
    if (best !== n) {
      [n.v, best.v] = [best.v, n.v];
      sift(best);
    }
  }
  function post(n) {
    if (!n) return;
    post(n.l);
    post(n.r);
    sift(n);
  }
  post(root);
  return root;
}
function fromLevelOrder(tokens) {
  let vals = tokens.map((t) => t.trim());
  if (
    !vals.length ||
    !vals[0] ||
    vals[0].toLowerCase() === "null" ||
    vals[0] === "#"
  )
    return null;
  let root = { v: Number(vals[0]), l: null, r: null },
    arr = [root];
  for (let i = 1; i < vals.length; i++) {
    let token = vals[i],
      node =
        token === "" || token.toLowerCase() === "null" || token === "#"
          ? null
          : { v: Number(token), l: null, r: null };
    let parentIndex = Math.floor((i - 1) / 2),
      parent = arr[parentIndex];
    if (parent) {
      if (i % 2 === 1) parent.l = node;
      else parent.r = node;
    }
    arr.push(node);
  }
  return root;
}
function drawTree(root, title) {
  let card = document.createElement("div");
  card.className = "treecard";
  let h = document.createElement("h3");
  h.textContent = title;
  card.appendChild(h);
  if (!root) {
    let em = document.createElement("div");
    em.className = "empty";
    em.textContent = "Empty tree";
    card.appendChild(em);
    return card;
  }
  let levels = 0;
  function inspect(n, d) {
    if (!n) return;
    levels = Math.max(levels, d);
    inspect(n.l, d + 1);
    inspect(n.r, d + 1);
  }
  inspect(root, 0);
  let spacing = 96,
    branchGap = 54,
    height = (levels + 1) * 86,
    cursor = 0,
    pos = new Map();
  function layout(n, d) {
    if (!n) return null;
    let x;
    if (n.l && n.r) {
      let lx = layout(n.l, d + 1),
        rx = layout(n.r, d + 1);
      x = (lx + rx) / 2;
    } else if (n.l) x = layout(n.l, d + 1) + branchGap;
    else if (n.r) x = layout(n.r, d + 1) - branchGap;
    else {
      x = cursor;
      cursor += spacing;
    }
    pos.set(n, { x, y: 45 + d * 86 });
    return x;
  }
  layout(root, 0);
  let xs = Array.from(pos.values()).map((p) => p.x),
    minX = Math.min(...xs),
    maxX = Math.max(...xs),
    width = Math.max(380, maxX - minX + 72),
    shift = (width - (maxX - minX)) / 2 - minX;
  for (let p of pos.values()) p.x += shift;
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.width = width + "px";
  svg.style.height = height + "px";
  svg.style.maxWidth = "none";
  svg.classList.add("tree");
  function edges(n) {
    if (!n) return;
    let p = pos.get(n);
    for (let c of [n.l, n.r])
      if (c) {
        let cp = pos.get(c),
          line = document.createElementNS(svg.namespaceURI, "line");
        line.setAttribute("x1", p.x);
        line.setAttribute("y1", p.y + 22);
        line.setAttribute("x2", cp.x);
        line.setAttribute("y2", cp.y - 22);
        line.classList.add("edge");
        svg.appendChild(line);
      }
    edges(n.l);
    edges(n.r);
  }
  edges(root);
  function circles(n) {
    if (!n) return;
    let p = pos.get(n),
      g = document.createElementNS("http://www.w3.org/2000/svg", "g"),
      c = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
      t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    c.setAttribute("cx", p.x);
    c.setAttribute("cy", p.y);
    c.setAttribute("r", 22);
    c.classList.add("node");
    t.setAttribute("x", p.x);
    t.setAttribute("y", p.y);
    t.classList.add("nodeText");
    t.textContent = n.v;
    g.append(c, t);
    svg.appendChild(g);
    circles(n.l);
    circles(n.r);
  }
  circles(root);
  card.appendChild(svg);
  return card;
}
function removeRootTwice(root, kind) {
  let stages = [],
    cur = clone(root);
  for (let step = 0; step < 2 && cur; step++) {
    let level = [];
    function bfs(n) {
      if (!n) return;
      level.push(n);
      if (n.l) bfsQueue.push(n.l);
      if (n.r) bfsQueue.push(n.r);
    }
    let bfsQueue = [cur];
    while (bfsQueue.length) {
      let n = bfsQueue.shift();
      level.push(n);
      if (n.l) bfsQueue.push(n.l);
      if (n.r) bfsQueue.push(n.r);
    } // correction below: breadth-first final element is deepest/rightmost
    if (level.length === 1) {
      cur = null;
      stages.push(null);
      continue;
    }
    let last = level[level.length - 1],
      parent = null,
      side = null;
    function find(n) {
      if (!n) return;
      if (n.l === last) {
        parent = n;
        side = "l";
        return;
      }
      if (n.r === last) {
        parent = n;
        side = "r";
        return;
      }
      find(n.l);
      if (!parent) find(n.r);
    }
    find(cur);
    cur.v = last.v;
    if (parent) parent[side] = null;
    heapify(cur, kind);
    stages.push(clone(cur));
  }
  return stages;
}
function validateNumbers(s) {
  let vals = s
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x !== "")
    .map(Number);
  return vals.length &&
    vals.every(Number.isFinite) &&
    new Set(vals).size === vals.length
    ? vals
    : null;
}
function buildProcess(values, bst) {
  let panel = document.createElement("div");
  panel.className = "panel guide build-process";
  let title = document.createElement("h2");
  title.textContent = "How these trees were built";
  panel.appendChild(title);
  let intro = document.createElement("p");
  intro.textContent =
    "Follow each step in order. Every diagram shows the tree after that step.";
  panel.appendChild(intro);
  let rules = document.createElement("div");
  rules.className = "rules-box";
  rules.innerHTML =
    "<strong>Rules:</strong> BST — smaller values go left, larger values go right. Min heap — each parent is less than or equal to its children. Max heap — each parent is greater than or equal to its children. Heap adjustments sift a value down by swapping with the smallest child (min) or largest child (max).";
  panel.appendChild(rules);
  function section(name, rule) {
    let s = document.createElement("section");
    s.className = "process-section";
    let h = document.createElement("h3");
    h.textContent = name;
    s.appendChild(h);
    let r = document.createElement("p");
    r.className = "note";
    r.textContent = rule;
    s.appendChild(r);
    let list = document.createElement("div");
    list.className = "step-list";
    s.appendChild(list);
    panel.appendChild(s);
    return list;
  }
  function step(list, n, text, tree, title) {
    let card = document.createElement("div");
    card.className = "step-card";
    let head = document.createElement("h4");
    head.textContent = "Step " + n;
    card.appendChild(head);
    let desc = document.createElement("p");
    desc.textContent = text;
    card.appendChild(desc);
    let visual = document.createElement("div");
    visual.className = "step-visual";
    visual.appendChild(drawTree(tree, title));
    card.appendChild(visual);
    list.appendChild(card);
  }
  let bstList = section(
    "1. Build the BST",
    "At each node, compare the next number: go left when it is smaller, right when it is larger, then place it in an empty child.",
  );
  for (let i = 0; i < values.length; i++) {
    let v = values[i],
      prior = makeBST(values.slice(0, i)),
      cur = prior,
      checks = [];
    if (i === 0) checks.push(v + " becomes the root.");
    else {
      while (cur) {
        if (v < cur.v) {
          checks.push(v + " < " + cur.v + ": go left.");
          if (!cur.l) {
            checks.push("The left spot is empty; insert " + v + ".");
            break;
          }
          cur = cur.l;
        } else {
          checks.push(v + " > " + cur.v + ": go right.");
          if (!cur.r) {
            checks.push("The right spot is empty; insert " + v + ".");
            break;
          }
          cur = cur.r;
        }
      }
    }
    step(
      bstList,
      i + 1,
      checks.join(" "),
      makeBST(values.slice(0, i + 1)),
      "BST after inserting " + v,
    );
  }
  function heapSteps(kind, label, rule) {
    let list = section(label, rule),
      copy = clone(bst),
      count = 0;
    function sift(n) {
      let log = [],
        best = n;
      if (n.l && (kind === "min" ? n.l.v < best.v : n.l.v > best.v)) best = n.l;
      if (n.r && (kind === "min" ? n.r.v < best.v : n.r.v > best.v)) best = n.r;
      if (best !== n) {
        let a = n.v,
          b = best.v;
        [n.v, best.v] = [best.v, n.v];
        log.push(
          "Parent " +
            a +
            " violates the rule; swap with " +
            (kind === "min" ? "smaller" : "larger") +
            " child " +
            b +
            ".",
        );
        let more = sift(best);
        log.push(...more);
      } else {
        log.push(
          "Node " + n.v + " satisfies the rule with its existing children.",
        );
      }
      return log;
    }
    function post(n) {
      if (!n) return;
      post(n.l);
      post(n.r);
      count++;
      let messages = sift(n);
      step(
        list,
        count,
        messages.join(" "),
        clone(copy),
        label + " after checking node " + n.v,
      );
    }
    post(copy);
  }
  heapSteps(
    "min",
    "2. Build the min heap",
    "Rule: each parent must be less than or equal to its children. Start at the lowest parents and work upward; if a parent is too large, swap it with the smaller child and keep sifting down.",
  );
  heapSteps(
    "max",
    "3. Build the max heap",
    "Rule: each parent must be greater than or equal to its children. Start at the lowest parents and work upward; if a parent is too small, swap it with the larger child and keep sifting down.",
  );
  return panel;
}
function run1() {
  let vals = validateNumbers($("values").value);
  $("error1").textContent = "";
  if (!vals) {
    $("error1").textContent =
      "Enter valid distinct numbers separated by commas.";
    return;
  }
  let bst = makeBST(vals),
    min = heapify(clone(bst), "min"),
    max = heapify(clone(bst), "max"),
    out = $("buildTrees");
  out.innerHTML = "";
  out.append(
    drawTree(clone(bst), "BST"),
    drawTree(min, "Min Heap (BST structure kept)"),
    drawTree(max, "Max Heap (BST structure kept)"),
  );
  $("processContent").innerHTML = "";
  $("processContent").append(buildProcess(vals, bst));
}
function run2() {
  let tokens = $("treeInput").value.split(","),
    out = $("heapifyTrees"),
    err = $("error2");
  err.textContent = "";
  let present = tokens.filter(
    (t) =>
      t.trim() !== "" && t.trim().toLowerCase() !== "null" && t.trim() !== "#",
  );
  if (present.some((t) => !Number.isFinite(Number(t.trim())))) {
    err.textContent = "Use numbers, null, or # placeholders only.";
    return;
  }
  let vals = present.map((t) => Number(t.trim()));
  if (new Set(vals).size !== vals.length) {
    err.textContent = "Please use distinct values in the #2 tree.";
    return;
  }
  let source = fromLevelOrder(tokens);
  if (!source) {
    err.textContent = "Tree input must start with a number.";
    return;
  }
  let min = heapify(clone(source), "min"),
    max = heapify(clone(source), "max");
  out.innerHTML = "";
  out.append(
    drawTree(min, "Min Heap (#2 source shape kept)"),
    drawTree(max, "Max Heap (#2 source shape kept)"),
  );
  let mins = removeRootTwice(min, "min"),
    maxs = removeRootTwice(max, "max"),
    rem = $("removeTrees");
  rem.innerHTML = "";
  rem.append(
    drawTree(mins[0], "Min Heap â€” after 1st root removal"),
    drawTree(mins[1], "Min Heap â€” after 2nd root removal"),
    drawTree(maxs[0], "Max Heap â€” after 1st root removal"),
    drawTree(maxs[1], "Max Heap â€” after 2nd root removal"),
  );
}
$("generate1").addEventListener("click", run1);
$("randomize1").addEventListener("click", () => {
  let pool = Array.from({ length: 90 }, (_, i) => i + 10);
  for (let i = pool.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  let entered = $("values")
    .value.split(",")
    .filter((x) => x.trim() !== "").length;
  let count = Math.max(11, Math.min(90, entered));
  $("values").value = pool.slice(0, count).join(",");
  run1();
  document.querySelector('[data-tab="process"]').click();
});
$("generate2").addEventListener("click", run2);
$("randomize2").addEventListener("click", () => {
  let pool = Array.from({ length: 90 }, (_, i) => i + 10);
  for (let i = pool.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  $("treeInput").value = pool.slice(0, 7).join(",");
  run2();
  document.querySelector('[data-tab="two"]').click();
});
document.querySelectorAll(".tabs button").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll(".tabs button")
      .forEach((x) => x.classList.remove("active"));
    document
      .querySelectorAll(".section")
      .forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    $(b.dataset.tab).classList.add("active");
  }),
);
run1();
run2();
