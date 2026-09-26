import java.io.*;
import java.nio.*;
import java.nio.charset.*;
import java.time.LocalDateTime;
import java.util.*;

/** UTF-8, newline framing with bounded frames; message bodies are Base64. */
final class ChatProtocol {
    static final int MAX_FRAME = 16384;
    private ChatProtocol() {}
    static BufferedReader reader(InputStream input) {
        return new BufferedReader(new InputStreamReader(input,StandardCharsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT)));
    }
    static String read(Reader reader) throws IOException {
        StringBuilder line=new StringBuilder(); int value;
        while((value=reader.read())!=-1) {
            if(value=='\n') return line.toString().endsWith("\r") ? line.substring(0,line.length()-1) : line.toString();
            if(line.length()>=MAX_FRAME) throw new IOException("Frame too large");
            line.append((char)value);
        }
        if(!line.isEmpty()) throw new EOFException("Incomplete frame");
        return null;
    }
    static String encode(String text) { return Base64.getEncoder().encodeToString(text.getBytes(StandardCharsets.UTF_8)); }
    static String decode(String encoded) {
        byte[] bytes=Base64.getDecoder().decode(encoded);
        if(bytes.length>8192) throw new IllegalArgumentException("Message too large");
        try { return StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(bytes)).toString(); }
        catch(CharacterCodingException invalid) { throw new IllegalArgumentException("Invalid UTF-8"); }
    }
    static Integer listing(String value) { int id=Integer.parseInt(value); if(id==-1)return null;if(id<=0)throw new IllegalArgumentException("Invalid listing");return id; }
    static String event(String kind,String requestId,Message m) {
        return kind+"\t"+requestId+"\t"+m.getId()+"\t"+(m.getListingId()==null?-1:m.getListingId())+"\t"+m.getSenderId()+"\t"+m.getReceiverId()+"\t"+m.getTimestamp()+"\t"+encode(m.getMessageText());
    }
    static Message message(String[] fields) {
        if(fields.length!=8)throw new IllegalArgumentException("Invalid event");
        return new Message(Integer.parseInt(fields[2]),listing(fields[3]),Integer.parseInt(fields[4]),Integer.parseInt(fields[5]),decode(fields[7]),LocalDateTime.parse(fields[6]));
    }
}
