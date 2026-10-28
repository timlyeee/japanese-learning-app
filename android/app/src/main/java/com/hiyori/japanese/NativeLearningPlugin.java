package com.hiyori.japanese;

import android.content.Intent;
import android.speech.tts.TextToSpeech;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.io.FileOutputStream;
import java.util.Locale;

@CapacitorPlugin(name = "NativeLearning")
public class NativeLearningPlugin extends Plugin {
    private TextToSpeech speech;
    private boolean ready;

    @Override public void load() {
        getActivity().runOnUiThread(() -> {
            speech = new TextToSpeech(getContext(), status -> {
                if (status == TextToSpeech.SUCCESS) {
                    int language = speech.setLanguage(Locale.JAPANESE);
                    ready = language != TextToSpeech.LANG_MISSING_DATA && language != TextToSpeech.LANG_NOT_SUPPORTED;
                    speech.setSpeechRate(0.8f);
                }
            });
        });
    }

    @PluginMethod public void speak(PluginCall call) {
        String text = call.getString("text", "");
        if (!ready) { call.reject("日语语音未就绪，请在手机的文字转语音设置中安装日语语音包后重新打开应用。"); return; }
        getActivity().runOnUiThread(() -> {
            int status = speech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "hiyori");
            if (status == TextToSpeech.ERROR) call.reject("朗读失败，请检查手机的日语语音设置。"); else call.resolve();
        });
    }

    @PluginMethod public void backup(PluginCall call) {
        try {
            File file = new File(getContext().getCacheDir(), "hiyori-progress.json");
            try (FileOutputStream output = new FileOutputStream(file)) {
                output.write(call.getString("content", "{}").getBytes(StandardCharsets.UTF_8));
            }
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("application/json");
            intent.putExtra(Intent.EXTRA_STREAM, FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", file));
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(Intent.createChooser(intent, "保存或分享学习进度"));
            call.resolve();
        } catch (Exception error) { call.reject("无法导出备份，请重试。", error); }
    }

    @Override protected void handleOnDestroy() { if (speech != null) { speech.stop(); speech.shutdown(); } }
}
