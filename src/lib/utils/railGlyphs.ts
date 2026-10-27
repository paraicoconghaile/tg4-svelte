import cLeftGlyph from '$lib/assets/glyphs/cLeft.svg?url';
import gGlyph from '$lib/assets/glyphs/g.svg?url';
import gRightGlyph from '$lib/assets/glyphs/gRight.svg?url';
import xLeftGlyph from '$lib/assets/glyphs/xLeft.svg?url';
import xRightGlyph from '$lib/assets/glyphs/xRight.svg?url';
import tGlyph from '$lib/assets/glyphs/t.svg?url';

export const railGlyphs: Record<string, string> = {
    C_LEFT: cLeftGlyph,
    C_ROTATED_LEFT: cLeftGlyph,
    G: gGlyph,
    G_ROTATED_RIGHT: gRightGlyph,
    G_RIGHT: gRightGlyph,
    LEFT_X: xLeftGlyph,
    X_LEFT: xLeftGlyph,
    X_RIGHT: xRightGlyph,
    RIGHT_X: xRightGlyph,
    T: tGlyph
};