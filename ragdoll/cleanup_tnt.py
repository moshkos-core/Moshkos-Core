path = r'ragdoll\ragdoll_background.js'
with open(path, encoding='utf-8') as f:
    content = f.read()

marker_start = "window.spawnAndDragGrenade = (e) => { e.preventDefault(); window.throwGrenade(); };"
marker_end = "// Key listener removed (now handled in shared.js with cooldown)"

idx1 = content.find(marker_start)
# Find the SECOND occurrence of marker_end (after marker_start)
idx2 = content.find(marker_end, idx1 + len(marker_start))

print('marker_start at char', idx1)
print('marker_end at char', idx2)

if idx1 >= 0 and idx2 > idx1:
    new_content = content[:idx1 + len(marker_start)] + '\n\n' + content[idx2:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Done. Chars:', len(new_content))
else:
    print('ERROR: Markers not found!')
    print('idx1=', idx1, 'idx2=', idx2)
