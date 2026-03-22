-- 创建收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, car_id)
);

-- 创建索引
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_car_id ON favorites(car_id);

COMMENT ON TABLE favorites IS '用户收藏表';
COMMENT ON COLUMN favorites.user_id IS '用户ID';
COMMENT ON COLUMN favorites.car_id IS '车型ID';
COMMENT ON COLUMN favorites.created_at IS '收藏时间';

-- 创建价格提醒表
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    target_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    triggered_at TIMESTAMPTZ
);

-- 创建索引
CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_car_id ON price_alerts(car_id);
CREATE INDEX idx_price_alerts_status ON price_alerts(status);

-- 创建更新时间触发器
CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE price_alerts IS '价格提醒表';
COMMENT ON COLUMN price_alerts.target_price IS '目标价格（万元）';
COMMENT ON COLUMN price_alerts.status IS '状态: active-监控中, triggered-已触发, cancelled-已取消';

-- 创建查询历史表
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    keyword VARCHAR(255),
    filters JSONB,
    result_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at);

COMMENT ON TABLE search_history IS '用户查询历史表';
COMMENT ON COLUMN search_history.keyword IS '搜索关键词';
COMMENT ON COLUMN search_history.filters IS '筛选条件（JSON格式）';
COMMENT ON COLUMN search_history.result_count IS '返回结果数量';
