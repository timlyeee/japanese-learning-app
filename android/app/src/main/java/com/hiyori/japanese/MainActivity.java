package com.hiyori.japanese;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeLearningPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
